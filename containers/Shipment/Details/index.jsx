"use client";

export default function KanbanBoard() {
const members = [
{
    id: 1,
    name: "Rainer Brown",
    email: "Rainerbrown@mail.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    bgColor: "bg-purple-500/20",
},
{
    id: 2,
    name: "Conny Rany",
    email: "connyrany@mail.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    bgColor: "bg-emerald-500/20",
},
{   
    id: 3,
    name: "Armin Falcon",
    email: "arfalcon@mail.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    bgColor: "bg-gray-500/20",
},
{
    id: 4,
    name: "James Sullivan",
    email: "Warren L.",
    avatar: "https://i.pravatar.cc/150?img=4",
    bgColor: "bg-gray-500/20",
},
{
    id: 5,
    name: "James Sullivan",
    email: "Warren L.",
    avatar: "https://i.pravatar.cc/150?img=4",
    bgColor: "bg-gray-500/20",
},
{
    id: 6,
    name: "James Sullivan",
    email: "Warren L.",
    avatar: "https://i.pravatar.cc/150?img=4",
    bgColor: "bg-gray-500/20",
},
];

return(
    <div className="min-h-screen  p-6 text-white">
        <h1 className="font-bold text-xl md:text-2xl">UPS-1500-STD</h1>
        <h3 className="text-[#A0AEC0] mt-1 text-xs md:text-sm">UB123900026BA</h3>
        <div className="flex flex-row items-center justify-between -mt-8">
            <div className="flex">
                <div className="text-[#A0AEC0] ">
                    <h2 className="text-xs md:text-sm">Shipment Status:</h2>
                    <h2 className="mt-7 text-xs md:text-sm">Recent Status Update :</h2>
                    <h2 className="mt-5 text-xs md:text-sm">Shipping UPS Tracker Owner:</h2>
                </div>
                <div className="ml-4">
                    <div>
                        <button className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-3xl text-white bg-[#0075FF]">In Progress</button>
                    </div>
                    <div className="mt-4 text-xs md:text-sm font-semibold">
                        <span>January 15, 2026</span>
                    </div>
                    <div className="w-35 mt-4">
                        {members.slice(0, 1).map((member) => (
                            <div
                            key={member.id}
                            className={`flex items-center justify-between w-full font-geist border border-white/[0.03] border-t-white/[0.09] mt-2 rounded-2xl ${
                                member.isActive
                                ? "bg-emerald-600/30 border border-emerald-500/50"
                                : "bg-[#575975]"
                            }`}
                            >
                            {/* Left Side - Avatar and Info */}
                            <div className="flex items-center gap-3 ">
                                <div className={`avatar ${member.isActive ? "online" : ""}`}>
                                <div className="w-7 h-7 rounded-full border-2 border-white">
                                    <img src={member.avatar} alt={member.name} />
                                </div>
                                </div>
                                <div>
                                <h3 className="text-white font-semibold text-sm">
                                    {member.name}
                                </h3>
                                </div>
                            </div>             
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="h-[150px] w-[150px] md:h-[250px] md:w-[250px] mr-10">
                <img src="/images/UPS.png" alt="UPS" />
            </div>
        </div>
        {/* texet area */}
        <div className="flex w-full text-base md:text-lg bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy  mt-8 rounded-2xl card">
            
            <div className="flex items-center gap-4 border-b-[0.5px] border-[#E5E5EC6E] px-6 pt-6">
                <h3 className="text-[#5B5A64] font-medium">Emails</h3>
                <h3 className="border-b-2 border-[#00E691] text-white font-medium">
                Notes
                </h3>
                <h3 className="text-[#5B5A64] font-medium">Attachments</h3>
                <h3 className="text-[#5B5A64] font-medium">Connected Records</h3>
                <h3 className="text-[#5B5A64] font-medium">Reports</h3>
            </div>
            
            <div className="px-6 pb-6">
                <div className="flex items-center justify-between mt-8 text-sm md:text-base">
                    <h3>Important Notes</h3>
                </div>
                <textarea
                    type="text"
                    placeholder="Write your note here"
                    className="w-full h-60 text-sm md:text-base font-medium bg-transparent text-white placeholder-gray-500 pl-4 py-4 mt-6 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                />
                <div className="flex items-center justify-end gap-2 mr-4">
                    <button className="btn mt-5 backdrop-blur-md text-white p-3 bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] rounded-2xl transition-all">
                    <div className="flex flex-row gap-2">
                        <span className="flex flex-row gap-2 items-center font-semibold">Cancel</span>
                    </div>
                    </button>
                    <button className="btn mt-5 bg-gradient-to-r from-[#0075F8] to-[#00387A] text-white p-4 border-2 border-white/[0.03] border-t-white/[0.09] rounded-2xl transition-all">
                    <div className="flex flex-row gap-2">
                        <span className="flex flex-row gap-2 items-center font-semibold">Save</span>
                    </div>
                    </button>
                </div>
            </div>
        </div>    
    </div>
);

}