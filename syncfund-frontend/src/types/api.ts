/**
 * Tipos que reflejan los DTOs del backend (application/dto/request y response).
 * Mantenerlos sincronizados con com.syncfund.application.dto.* del backend.
 */

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  generalSummary: number;
}

export interface PersonalWalletResponse {
  walletId: number;
  name: string;
  currentBalance: number;
  monthlySavingsGoal: number;
  cushionBalance: number;
  ownerId: number;
}

export interface SharedProjectResponse {
  projectId: number;
  name: string;
  description: string;
  currentBalance: number;
  adminId: number;
  memberIds: number[];
}

export interface TransactionResponse {
  transactionId: number;
  amount: number;
  description: string;
  dateTime: string;
  type: 'INGRESO' | 'GASTO';
  originWalletId: number;
  originWalletType: 'PERSONAL' | 'SHARED';
  involvedIdsList: number[];
  categoryId: number | null;
}

export interface CategoryResponse {
  categoryId: number;
  name: string;
  monthlyLimit: number;
}

export interface CreateCategoryRequest {
  name: string;
  monthlyLimit: number;
}

export interface CategorizeTransactionRequest {
  categoryId: number;
}

export interface NetBalanceResponse {
  userId: number;
  projectId: number;
  netBalance: number;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Lo que ahora devuelve /auth/register y /auth/login (antes era solo UserResponse). */
export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface SetSavingsGoalRequest {
  monthlySavingsGoal: number;
}

export interface ManageCushionRequest {
  amount: number;
  type: 'APARTAR' | 'LIBERAR';
}

export interface CreateSharedProjectRequest {
  name: string;
  description?: string;
  adminId: number;
}

export interface AddMemberRequest {
  email: string;
}

export interface RegisterSelectiveExpenseRequest {
  amount: number;
  payerId: number;
  involvedIdsList: number[];
  description: string;
  categoryId?: number;
}

export interface DistributeContributionRequest {
  amount: number;
  contributorId: number;
  description: string;
}

export interface CreateTransactionRequest {
  amount: number;
  description: string;
  type: 'INGRESO' | 'GASTO';
  originWalletId: number;
  originWalletType: 'PERSONAL' | 'SHARED';
  involvedIdsList?: number[];
  categoryId?: number;
  allowOverdraft?: boolean;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}
