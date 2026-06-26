<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\ExpiredException;
use App\Models\User;
use Exception;

class Auth
{
	public function handle(Request $request, Closure $next)
	{
		$authHeader = $request->header('Authorization');

		if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
			return response()->json([
				'status' => 'error',
				'error' => 'Not authorized to access this route'
			], 401);
		}

		$token = explode(' ', $authHeader)[1];

		try {
			$jwtSecret = env('JWT_SECRET', config('app.jwt_secret'));
			if (!$jwtSecret) {
				throw new Exception('JWT secret key is missing.');
			}

			$decoded = JWT::decode($token, $jwtSecret, ['HS256']);
			$user = User::find($decoded->id);

			if (!$user) {
				return response()->json([
					'status' => 'error',
					'error' => 'User not found'
				], 401);
			}

			$request->attributes->set('user', $user);

			return $next($request);
		} catch (ExpiredException $e) {
			return response()->json([
				'status' => 'error',
				'error' => 'Token expired'
			], 401);
		} catch (Exception $e) {
			return response()->json([
				'status' => 'error',
				'error' => 'Invalid token: ' . $e->getMessage()
			], 401);
		}
	}

	/**
	 * Authorize specific abilities
	 */
	public function authorize(...$abilities)
	{
		return function (Request $request, Closure $next) use ($abilities) {
			$user = $request->attributes->get('user');

			if (!$user || !in_array($user->ability, $abilities)) {
				return response()->json([
					'status' => 'error',
					'error' => 'User ability ' . ($user->ability ?? 'unknown') . ' is not authorized to access this route'
				], 403);
			}

			return $next($request);
		};
	}
}
