"use client";
import { FaCircle } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { FiMessageCircle, FiStar } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function KanbanBoard() {
    const router = useRouter();

  const tasks = [
    {
      id: 1,
      taskName: "Finalize Project Proposal",
      project: "Website Redesign",
      estimation: "01 Nov - 7 Nov 2026",
      priority: "Urgent",
      progress: "80%",
      assignee: [
        {
          id: 1,
          name: "Rainer Brown",
          email: "Rainerbrown@mail.com",
          avatar: "/images/assignee1.jpg",
          bgColor: "bg-purple-500/20",
        },
        {
          id: 2,
          name: "Conny Rany",
          email: "connyrany@mail.com",
          avatar: "/images/assignee2.jpg",
          bgColor: "bg-emerald-500/20",
        },
        {
          id: 3,
          name: "Armin Falcon",
          email: "arfalcon@mail.com",
          avatar: "/images/assignee3.jpg",
          bgColor: "bg-gray-500/20",
        },
        {
          id: 4,
          name: "Armin Falcon",
          email: "arfalcon@mail.com",
          avatar: "/images/assignee3.jpg",
          bgColor: "bg-gray-500/20",
        },
      ],
    },
  ];
    return(
        <div className="min-h-screen  p-6 text-[#101437] dark:text-white">
            <h1 className="font-bold text-2xl">Task overveiw</h1>
            <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center justify-left gap-10 w-full ">
                <p className="text-7xl font-bold font-gilroy">80</p>
                <div className="flex flex-col items-start justify-end text-xl w-30">
                <p>
                    Total <br />
                    Tasks
                </p>
                </div>
            </div>
            <div className="flex items-center justify-left gap-10 w-full">
                <p className="text-6xl font-bold text-7xl">15</p>
                <div className="flex flex-col items-right justify-end text-xl w-40">
                <p>
                    Tasks Due <br />
                    Today
                </p>
                </div>
            </div>
            <div className="flex items-center justify-left gap-10 w-full">
                <p className="text-6xl font-bold text-7xl">20</p>
                <div className="flex flex-col items-start justify-end text-xl">
                <p>
                    Overdue <br />
                    Tasks
                </p>
                </div>
            </div>
            <div className="flex items-center justify-left gap-10 w-full">
                <p className="text-6xl font-bold text-7xl">150</p>
                <div className="flex flex-col items-start justify-end text-right text-xl">
                <p>
                    Tasks <br />
                    Completed
                </p>
                </div>
            </div>
            </div>
            {/* card */}
            
        </div>
    )
};