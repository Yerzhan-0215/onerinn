export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка авторизации</h1>
        <p className="text-gray-700">Попробуйте снова или используйте другой способ входа.</p>
        <a href="/ru/register" className="mt-4 inline-block text-blue-600 hover:underline">
          Вернуться к регистрации
        </a>
      </div>
    </div>
  );
}
