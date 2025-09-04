'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Verificando conexão...');
  const [user, setUser] = useState<any>(null);
  const [testData, setTestData] = useState<any[]>([]);

  // Teste de autenticação
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setConnectionStatus(`Erro na autenticação: ${error.message}`);
          return;
        }
        setConnectionStatus('Conexão com Supabase bem-sucedida!');
        setUser(session?.user || null);
      } catch (err) {
        setConnectionStatus(`Erro inesperado: ${String(err)}`);
      }
    };

    // Teste de banco de dados
    const checkDatabase = async () => {
      try {
        const { data, error } = await supabase.from('test_connection').select('*');
        if (error) {
          setConnectionStatus(`Erro no banco de dados: ${error.message}`);
          return;
        }
        setTestData(data || []);
      } catch (err) {
        setConnectionStatus(`Erro inesperado no banco: ${String(err)}`);
      }
    };

    checkConnection();
    checkDatabase();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Teste de Conexão com Supabase</h1>
        <p className="text-lg mb-4">{connectionStatus}</p>
        {user ? (
          <p className="text-green-600">Usuário conectado: {user.email}</p>
        ) : (
          <p className="text-yellow-600">Nenhum usuário conectado</p>
        )}
        <h2 className="text-xl font-semibold mt-6 mb-2">Dados do Banco</h2>
        {testData.length > 0 ? (
          <ul className="list-disc pl-5">
            {testData.map((item) => (
              <li key={item.id} className="text-gray-700">{item.message}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhum dado encontrado na tabela.</p>
        )}
      </div>
    </div>
  );
}
