// import { createTRPCReact } from '@trpc/react-query';
// import type { AppRouter } from '../../../server';

// export const trpc = createTRPCReact<AppRouter>();

import { createTRPCContext } from "@trpc/tanstack-react-query"
import type { AppRouter } from "../../../server"

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>()
