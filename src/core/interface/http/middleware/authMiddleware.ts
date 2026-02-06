import { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { RoleRepository } from "../../../domain/repositories/RoleRepository";
import { UnauthorizedError, ForbiddenError } from "../../../domain/errors/DomainErrors";
import { RoleType, RoleTypeEnum } from '../../../domain/entities/Role';

export interface AuthRequest extends Request {
  userAuth?: {
    clerkUserId: string;
    role: RoleType;
    userId: string;
  };
}

export function createUserProvisioningMiddleware(userRepository: UserRepository, roleRepository: RoleRepository) {
  return async function userProvisioningMiddleware(
    req: AuthRequest,
    _: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId: clerkUserId, sessionClaims } = getAuth(req);

      if (!clerkUserId) {
        throw new UnauthorizedError("Authentication required");
      }

      let user = await userRepository.findByClerkId(clerkUserId);

      if (!user) {
        let roleType = (sessionClaims?.role as RoleType | undefined);

        if (!roleType || (roleType !== RoleTypeEnum.ADMIN && roleType !== RoleTypeEnum.CUSTOMER)) {
          roleType = RoleTypeEnum.CUSTOMER;
        }

        let role = await roleRepository.findByType(roleType);

        if (!role) {
          role = await roleRepository.create({
            type: roleType,
          });
        }

        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        const primaryEmail = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId);

        if (!primaryEmail) {
          throw new UnauthorizedError("User email not found");
        }

        user = await userRepository.create({
          clerkId: clerkUserId,
          email: primaryEmail.emailAddress,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || null,
          roleId: role.id,
        });
      }

      const userRole = await roleRepository.findById(user.roleId);

      if (!userRole) {
        throw new UnauthorizedError("User role not found");
      }

      req.userAuth = {
        clerkUserId,
        role: userRole.type,
        userId: user.id,
      };

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        next(error);
      } else {
        next(new UnauthorizedError("Authentication failed"));
      }
    }
  };
}
