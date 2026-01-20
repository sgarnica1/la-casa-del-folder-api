import { Role } from "../entities/Role";
import { RoleType } from "../entities/Role";

export interface RoleRepository {
  findByType(type: RoleType): Promise<Role | null>;
  findById(id: string): Promise<Role | null>;
  create(role: Omit<Role, "id" | "createdAt" | "updatedAt">): Promise<Role>;
}
