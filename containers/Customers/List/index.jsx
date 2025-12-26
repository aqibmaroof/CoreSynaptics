// pages/customers/index.tsx (or components/CustomersListPage.tsx)

import Link from "next/link";

// Dummy data for demonstration
const dummyCustomers = [
  {
    id: 101,
    name: "Alice Johnson",
    email: "alice.j@example.com",
    phone: "555-0101",
    status: "Active",
  },
  {
    id: 102,
    name: "Bob Smith",
    email: "bob.s@example.com",
    phone: "555-0102",
    status: "Pending",
  },
  {
    id: 103,
    name: "Charlie Brown",
    email: "charlie.b@example.com",
    phone: "555-0103",
    status: "Inactive",
  },
  {
    id: 104,
    name: "Diana Prince",
    email: "diana.p@example.com",
    phone: "555-0104",
    status: "Active",
  },
];

const ListCustomer = () => {
  // Function to determine the badge color based on status
  const getStatusBadge = (status) => {
    let colorClass = "";
    switch (status) {
      case "Active":
        colorClass = "badge-success";
        break;
      case "Inactive":
        colorClass = "badge-error";
        break;
      case "Pending":
        colorClass = "badge-warning";
        break;
      default:
        colorClass = "badge-neutral";
    }
    return (
      <div className={`badge ${colorClass} text-xs font-medium`}>{status}</div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#183431] dark:text-white">
          Customer List
        </h1>
        {/* <Link href="/Customers/Edit" passHref>
         Use the daisyUI btn class for styling
          <button className="btn btn-accent">+ Add Customer</button>
        </Link> */}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        {/* Search Input using daisyUI input class */}
        <input
          type="text"
          placeholder="Search customers..."
          className="input input-bordered w-full sm:w-80 bg-[#f6f6f6] dark:bg-[#1e4742] placeholder:text-[#183431] dark:placeholder:text-white"
        />
        {/* Placeholder for filter/sort dropdowns if needed */}
        {/* <select className="select select-bordered w-full sm:w-40">
          <option disabled selected>Filter by Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Pending</option>
        </select> */}
      </div>

      <div className="overflow-x-auto shadow-xl rounded-lg">
        {/* daisyUI table class with 'table-zebra' for striped rows */}
        <table className="table w-full ">
          {/* Table Head */}
          <thead className="text-center text-[#183431] dark:text-white bg-[#f6f6f6] dark:bg-[#1e4742]">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {dummyCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="text-center cursor-pointer bg-[#f6f6f6] dark:bg-[#1e4742]  hover:bg-gray-50 dark:hover:bg-[#183431]"
              >
                <td className="font-mono text-sm">{customer.id}</td>
                <td className="font-semibold">{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{getStatusBadge(customer.status)}</td>
                <td className="space-x-2">
                  {/* Edit Button */}
                  <Link href={`/Customers/Edit/${customer.id}`}>
                    <button className="btn btn-outline btn-accent btn-sm">
                      Edit
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          {/* You can optionally add a tfoot for summary data */}
          {/* <tfoot>
             <tr>
               <td colSpan={6} className="text-right py-4 text-sm">Total Customers: {dummyCustomers.length}</td>
             </tr>
          </tfoot> */}
        </table>
      </div>

      {/* Pagination Placeholder (using daisyUI pagination styles) */}
      <div className="flex justify-center mt-8 ">
        <div className="join shadow-lg">
          <button className="join-item btn border-none  bg-[#f6f6f6] dark:bg-[#1e4742]">«</button>
          <button className="join-item btn border-none btn-active  bg-[#f6f6f6] dark:bg-[#1e4742]">Page 1</button>
          <button className="join-item btn border-none bg-[#f6f6f6] dark:bg-[#1e4742]">Page 2</button>
          <button className="join-item btn border-none bg-[#f6f6f6] dark:bg-[#1e4742]">»</button>
        </div>
      </div>
    </div>
  );
};

export default ListCustomer;
