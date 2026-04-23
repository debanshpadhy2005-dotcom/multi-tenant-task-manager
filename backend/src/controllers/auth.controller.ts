import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register new organization
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { organizationName, email, firstName, lastName, password } = req.body;

    const result = await this.authService.register({
      organizationName,
      email,
      firstName,
      lastName,
      password,
    });

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: 'admin',
        },
        organization: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
        },
        tokens: result.tokens,
      },
    });
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await this.authService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: (result.user as any).role_name,
          tenantId: result.user.tenantId,
        },
        tokens: result.tokens,
      },
    });
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const tokens = await this.authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens },
    });
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (user as any).role_name,
        permissions: (user as any).permissions,
        tenantId: user.tenantId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  });

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;
    const tenantId = req.tenantId!;

    await this.authService.changePassword(userId, tenantId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  /**
   * Logout (client-side token removal)
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    // In a JWT-based system, logout is typically handled client-side
    // Here we can add token to a blacklist if needed (requires Redis)
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}
