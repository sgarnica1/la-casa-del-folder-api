import { startServer } from "./core/interface/http/app";
import { container } from "./core/container";

startServer(container.controllers, container.repositories);
