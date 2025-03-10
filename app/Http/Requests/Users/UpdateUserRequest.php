<?php

namespace App\Http\Requests\Users;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\App;
use Illuminate\Validation\Rules;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Verificar si el usuario actual está autenticado
        if (!$this->user()) {
            return false;
        }

        // Obtener el usuario objetivo
        $targetUser = User::find($this->route('id'));
        if (!$targetUser) {
            return false;
        }

        // Superadmin puede editar a cualquier usuario
        if ($this->user()->role === 'superadmin') {
            return true;
        }

        // Admin solo puede editar a usuarios normales
        if ($this->user()->role === 'admin') {
            return $targetUser->role === 'user';
        }

        // Usuario normal no puede editar a otros usuarios
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('id');
        $userService = App::make(UserService::class);
        
        // Reglas base para todos los casos
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$userId,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'phone' => ['required', 'string', 'max:15', 'regex:/^[6789]\d{8}$/'],
            'dni' => ['required', 'string', 'max:20', 'unique:users,dni,'.$userId, 'regex:/^\d{8}[A-Za-z]$/'],
        ];
        
        // Solo superadmin puede cambiar roles
        if ($userService->canManageRoles()) {
            $rules['role'] = 'required|string|in:user,admin,superadmin';
        }
        
        return $rules;
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'email' => 'correo electrónico',
            'password' => 'contraseña',
            'phone' => 'teléfono',
            'dni' => 'documento de identidad',
            'role' => 'rol'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio',
            'email.required' => 'El correo electrónico es obligatorio',
            'email.email' => 'El formato del correo electrónico no es válido',
            'email.unique' => 'Este correo electrónico ya está registrado',
            'password.confirmed' => 'Las contraseñas no coinciden',
            'phone.required' => 'El teléfono es obligatorio',
            'phone.regex' => 'El formato del teléfono no es válido (debe empezar por 6, 7, 8 o 9 y tener 9 dígitos)',
            'dni.required' => 'El DNI es obligatorio',
            'dni.unique' => 'Este DNI ya está registrado',
            'dni.regex' => 'El formato del DNI no es válido (8 números seguidos de 1 letra)',
            'role.required' => 'El rol es obligatorio',
            'role.in' => 'El rol seleccionado no es válido'
        ];
    }
}