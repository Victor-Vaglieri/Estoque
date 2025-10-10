// app/(dashboard)/page.tsx

"use client";

// Um componente pequeno para os cards de estatísticas
const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
  </div>
);

export default function DashboardHomePage() {
  return (
    <>
      {/* Cabeçalho da Página */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Inventory Overview</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm hover:bg-gray-50">Export</button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">+ New Product</button>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total SKUs" value="1,248" />
        <StatCard title="Units in Stock" value="32,410" />
        <StatCard title="Low Stock" value="58" />
        <StatCard title="Backorders" value="12" />
      </div>

      {/* Tabela de Movimentações (com dados fictícios) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Stock Movements</h3>
        {/* Aqui entrariam os filtros */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">SKU</th>
                <th scope="col" className="px-6 py-3">Product</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Qty</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4">HD-9921</td>
                <td className="px-6 py-4">Wireless Headphones</td>
                <td className="px-6 py-4 text-green-500">↓ Inbound</td>
                <td className="px-6 py-4">+240</td>
                <td className="px-6 py-4"><button className="font-medium text-blue-600 hover:underline">Details</button></td>
              </tr>
              {/* Adicione mais linhas aqui */}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}