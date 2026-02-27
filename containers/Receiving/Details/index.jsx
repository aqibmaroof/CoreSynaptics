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
        <h1 className="font-bold text-2xl">UPS-1500-STD</h1>
        <h3 className="text-[#A0AEC0] mt-1">UB123900026BA</h3>
        <div className="flex flex-row items-center justify-between -mt-8">
            <div className="flex">
                <div className="text-[#A0AEC0] ">
                    <h2>Shipment Status:</h2>
                    <h2 className="mt-6">Recent Status Update :</h2>
                    <h2 className="mt-4">Shipping UPS Tracker Owner:</h2>
                </div>
                <div className="ml-4">
                    <div>
                        <button className="px-3 py-1.5 rounded-3xl text-white bg-[#0075FF]">In Progress</button>
                    </div>
                    <div className="mt-3">
                        <span>January 15, 2026</span>
                    </div>
                    <div className="w-35 mt-3">
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
            <div className="h-[250px] w-[250px] mr-10">
                <img src="/images/UPS.png" alt="UPS" />
            </div>
        </div>
        {/* Equipment's Information */}
        <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy  mt-8 rounded-2xl card">
            <div className="flex items-center justify-between ml-4 mt-6 mr-4">
                <select
                className="text-2xl font-bold"
                name="Create Task"
                id="Create Task"
            >
                <option>Task Information</option>
                </select>
                <svg width="30" height="30" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M39.3325 9.9291C39.5067 10.1935 39.5843 10.5099 39.5522 10.8248C39.5202 11.1398 39.3804 11.4341 39.1565 11.6579L22.3027 28.5099C22.1303 28.6822 21.9151 28.8056 21.6793 28.8674L14.6595 30.7008C14.4275 30.7613 14.1836 30.7601 13.9522 30.6972C13.7208 30.6344 13.5098 30.5121 13.3402 30.3425C13.1707 30.173 13.0484 29.962 12.9855 29.7306C12.9227 29.4992 12.9215 29.2553 12.982 29.0233L14.8153 22.0053C14.8702 21.7951 14.971 21.5997 15.1105 21.4333L32.0267 4.5281C32.2845 4.27061 32.634 4.12598 32.9983 4.12598C33.3627 4.12598 33.7122 4.27061 33.97 4.5281L39.1565 9.71277C39.2206 9.7803 39.2794 9.85262 39.3325 9.9291ZM36.2397 10.6844L32.9983 7.44493L17.382 23.0613L16.2362 27.4484L20.6233 26.3026L36.2397 10.6844Z" fill="white"/>
                <path d="M36.0092 31.4601C36.5103 27.1774 36.6703 22.8616 36.4877 18.5535C36.4834 18.4519 36.5002 18.3506 36.5371 18.2559C36.5741 18.1613 36.6303 18.0753 36.7022 18.0035L38.5062 16.1995C38.5555 16.1499 38.618 16.1156 38.6863 16.1007C38.7547 16.0859 38.8258 16.091 38.8913 16.1156C38.9567 16.1402 39.0136 16.1832 39.0553 16.2394C39.0969 16.2955 39.1214 16.3625 39.1258 16.4323C39.4645 21.5496 39.3356 26.6871 38.7408 31.781C38.3082 35.488 35.3308 38.3938 31.6403 38.8063C25.2335 39.5154 18.7679 39.5154 12.361 38.8063C8.67234 38.3938 5.69318 35.488 5.26051 31.781C4.50171 25.2825 4.50171 18.7178 5.26051 12.2193C5.69318 8.51231 8.67051 5.60647 12.361 5.19397C17.2238 4.65689 22.123 4.52628 27.0075 4.80347C27.0774 4.80849 27.1444 4.83344 27.2006 4.87536C27.2567 4.91728 27.2997 4.97442 27.3244 5.04001C27.3491 5.1056 27.3545 5.17689 27.3399 5.24544C27.3253 5.314 27.2914 5.37694 27.2422 5.42681L25.4217 7.24547C25.3505 7.31669 25.2654 7.37249 25.1717 7.40939C25.0781 7.4463 24.9778 7.46351 24.8772 7.45997C20.8012 7.32037 16.7205 7.47661 12.6672 7.92747C11.4827 8.05857 10.3771 8.58513 9.52879 9.4221C8.68051 10.2591 8.13916 11.3576 7.99218 12.5401C7.25675 18.8254 7.25675 25.1749 7.99218 31.4601C8.13916 32.6427 8.68051 33.7412 9.52879 34.5782C10.3771 35.4151 11.4827 35.9417 12.6672 36.0728C18.818 36.7603 25.1833 36.7603 31.336 36.0728C32.5204 35.9417 33.6261 35.4151 34.4744 34.5782C35.3227 33.7412 35.8622 32.6427 36.0092 31.4601Z" fill="white"/>
                </svg>

            </div>
            <div className="flex items-center justify-start gap-10 mx-6 mt-6">
                <div>
                    <h3 className="text-base">Equipment</h3>
                    <h2 className="font-semibold text-lg">UPS-1500-STD</h2>
                </div>
                <div className="ml-4">
                    <h3 className="text-base">Date inspection performed</h3>
                    <h2 className="font-semibold text-lg flex items-center gap-4 ">
                       <span>Feb 01, 2026  </span>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.99805 1.49902V3.74804" stroke="#A0AEC0" stroke-width="1.46186" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M11.9941 1.49902V3.74804" stroke="#A0AEC0" stroke-width="1.46186" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M2.62305 6.81445H15.3675" stroke="#A0AEC0" stroke-width="1.46186" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M15.7421 6.37239V12.7446C15.7421 14.9936 14.6176 16.493 11.9938 16.493H5.99641C3.37256 16.493 2.24805 14.9936 2.24805 12.7446V6.37239C2.24805 4.12337 3.37256 2.62402 5.99641 2.62402H11.9938C14.6176 2.62402 15.7421 4.12337 15.7421 6.37239Z" stroke="#A0AEC0" stroke-width="1.46186" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M11.7652 10.2703H11.772" stroke="#A0AEC0" stroke-width="1.46186" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M11.7652 12.5194H11.772" stroke="#A0AEC0" stroke-width="1.46186" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.99181 10.2703H8.99855" stroke="#A0AEC0" stroke-width="1.46186" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.99181 12.5194H8.99855" stroke="#A0AEC0" stroke-width="1.46186" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6.21837 10.2703H6.22511" stroke="#A0AEC0" stroke-width="1.46186" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6.21837 12.5194H6.22511" stroke="#A0AEC0" stroke-width="1.46186" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                       
                    </h2>
                </div>
                <div className="ml-4">
                    <h3 className="text-base">Inspection performed by</h3>
                    <h2 className="font-semibold text-lg">John Robert</h2>
                </div>
                <div className="ml-4">
                    <h3 className="text-base">Serial Number</h3>
                    <h2 className="font-semibold text-lg">56463525353466</h2>
                </div>                
            </div>

            <div className="flex items-center justify-start gap-10 mx-6 mt-8 mb-8">
                <div>
                    <h3 className="text-base">Model Number</h3>
                    <h2 className="font-semibold text-lg">AS-157851651</h2>
                </div>
                <div className="ml-8">
                    <h3 className="text-base">Manufacturer</h3>
                    <h2 className="font-semibold text-lg flex items-center gap-4 ">
                        ABC Company
                    </h2>
                </div>
                <div className="ml-22">
                    <h3 className="text-base">Equipment received by</h3>
                    <h2 className="font-semibold text-lg">Alex Miller</h2>
                </div>
                <div className="ml-8">
                    <h3 className="text-base">Equipment description/type</h3>
                    <h2 className="font-semibold text-lg">Equipment description here</h2>
                </div>                
            </div>
        </div>

        {/* Delivery Inspection Status */}
        <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy  mt-8 rounded-2xl card">
            <div className="flex items-center justify-between ml-4 mt-6 mr-4">
                <select
                className="text-2xl font-bold"
                name="Create Task"
                id="Create Task"
            >
                <option>Delivery Inspection Status</option>
                </select>
                <svg width="30" height="30" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M39.3325 9.9291C39.5067 10.1935 39.5843 10.5099 39.5522 10.8248C39.5202 11.1398 39.3804 11.4341 39.1565 11.6579L22.3027 28.5099C22.1303 28.6822 21.9151 28.8056 21.6793 28.8674L14.6595 30.7008C14.4275 30.7613 14.1836 30.7601 13.9522 30.6972C13.7208 30.6344 13.5098 30.5121 13.3402 30.3425C13.1707 30.173 13.0484 29.962 12.9855 29.7306C12.9227 29.4992 12.9215 29.2553 12.982 29.0233L14.8153 22.0053C14.8702 21.7951 14.971 21.5997 15.1105 21.4333L32.0267 4.5281C32.2845 4.27061 32.634 4.12598 32.9983 4.12598C33.3627 4.12598 33.7122 4.27061 33.97 4.5281L39.1565 9.71277C39.2206 9.7803 39.2794 9.85262 39.3325 9.9291ZM36.2397 10.6844L32.9983 7.44493L17.382 23.0613L16.2362 27.4484L20.6233 26.3026L36.2397 10.6844Z" fill="white"/>
                <path d="M36.0092 31.4601C36.5103 27.1774 36.6703 22.8616 36.4877 18.5535C36.4834 18.4519 36.5002 18.3506 36.5371 18.2559C36.5741 18.1613 36.6303 18.0753 36.7022 18.0035L38.5062 16.1995C38.5555 16.1499 38.618 16.1156 38.6863 16.1007C38.7547 16.0859 38.8258 16.091 38.8913 16.1156C38.9567 16.1402 39.0136 16.1832 39.0553 16.2394C39.0969 16.2955 39.1214 16.3625 39.1258 16.4323C39.4645 21.5496 39.3356 26.6871 38.7408 31.781C38.3082 35.488 35.3308 38.3938 31.6403 38.8063C25.2335 39.5154 18.7679 39.5154 12.361 38.8063C8.67234 38.3938 5.69318 35.488 5.26051 31.781C4.50171 25.2825 4.50171 18.7178 5.26051 12.2193C5.69318 8.51231 8.67051 5.60647 12.361 5.19397C17.2238 4.65689 22.123 4.52628 27.0075 4.80347C27.0774 4.80849 27.1444 4.83344 27.2006 4.87536C27.2567 4.91728 27.2997 4.97442 27.3244 5.04001C27.3491 5.1056 27.3545 5.17689 27.3399 5.24544C27.3253 5.314 27.2914 5.37694 27.2422 5.42681L25.4217 7.24547C25.3505 7.31669 25.2654 7.37249 25.1717 7.40939C25.0781 7.4463 24.9778 7.46351 24.8772 7.45997C20.8012 7.32037 16.7205 7.47661 12.6672 7.92747C11.4827 8.05857 10.3771 8.58513 9.52879 9.4221C8.68051 10.2591 8.13916 11.3576 7.99218 12.5401C7.25675 18.8254 7.25675 25.1749 7.99218 31.4601C8.13916 32.6427 8.68051 33.7412 9.52879 34.5782C10.3771 35.4151 11.4827 35.9417 12.6672 36.0728C18.818 36.7603 25.1833 36.7603 31.336 36.0728C32.5204 35.9417 33.6261 35.4151 34.4744 34.5782C35.3227 33.7412 35.8622 32.6427 36.0092 31.4601Z" fill="white"/>
                </svg>
            </div>           

            <div className="flex items-center justify-start gap-20 mx-6 mt-8 mb-8">
                <div>
                    <h3 className="text-base">Conforming</h3>
                    <h2 className="font-semibold text-lg">03</h2>
                </div>
                <div className="ml-8">
                    <h3 className="text-base">Deficient</h3>
                    <h2 className="font-semibold text-lg flex items-center gap-4 ">
                        02
                    </h2>
                </div>
                <div className="ml-22">
                    <h3 className="text-base">N/A</h3>
                    <h2 className="font-semibold text-lg">01</h2>
                </div>               
            </div>
        </div>

        {/* Delivery Inspection */}
        <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy  mt-8 rounded-2xl card">
            <div className="flex items-center justify-between ml-4 mt-6 mr-4">
                <select
                className="text-2xl font-bold"
                name="Create Task"
                id="Create Task"
                >
                <option>Delivery Inspection</option>
                </select>
            </div>           

            <div className="mt-8 mb-4">
                <div className="flex items-center justify-between mx-6">
                    <h3 className="text-base font-semibold">
                        <span className="text-base">#1  </span>
                        Confirm shipping bill of lading or shipping invoic</h3>
                    <select
                        className="text-sm font-semibold border border rounded-3xl px-4.5 py-2.5 bg-[#00E691]"
                        name="Create Task"
                        id="Create Task"
                        >
                        <option>Yes</option>
                    </select>
                </div> 
                <div className="flex items-center justify-between mx-6 mt-4">
                    <h3 className="text-base font-semibold">
                        <span className="text-base">#2  </span>
                        Confirm damage, missing components, or deficienci
                    </h3>
                    <select
                        className="text-sm font-semibold border border rounded-3xl px-4.5 py-2.5 bg-[#0075FF]"
                        name="Create Task"
                        id="Create Task"
                        >
                        <option>No</option>
                    </select>
                </div> 
                <div className="flex items-center justify-between mx-6 mt-4">
                    <h3 className="text-base font-semibold">
                        <span className="text-base">#3  </span>
                        Confirm equipment was properly protected from weat
                    </h3>
                    <select
                        className="text-sm font-semibold border border rounded-3xl px-4.5 py-2.5 bg-[#565875]"
                        name="Create Task"
                        id="Create Task"
                        >
                        <option>N/A</option>
                    </select>
                </div> 
                <div className="flex items-center justify-between mx-6 mt-4">
                    <h3 className="text-base font-semibold">
                        <span className="text-base">#4  </span>
                        Confirm equipment is clean and dry
                    </h3>
                    <select
                        className="text-sm font-semibold border border rounded-3xl px-4.5 py-2.5 bg-[#565875]"
                        name="Create Task"
                        id="Create Task"
                        >
                        <option>N/A</option>
                    </select>
                </div> 
                                             
            </div>
        </div>

        {/* Equipment Specs */}
        <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy  mt-8 rounded-2xl card">
            <div className="flex items-center justify-between ml-4 mt-6 mr-4">
                <select
                className="text-2xl font-bold"
                name="Create Task"
                id="Create Task"
            >
                <option>Equipment Specs</option>
                </select>
                <svg width="30" height="30" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M39.3325 9.9291C39.5067 10.1935 39.5843 10.5099 39.5522 10.8248C39.5202 11.1398 39.3804 11.4341 39.1565 11.6579L22.3027 28.5099C22.1303 28.6822 21.9151 28.8056 21.6793 28.8674L14.6595 30.7008C14.4275 30.7613 14.1836 30.7601 13.9522 30.6972C13.7208 30.6344 13.5098 30.5121 13.3402 30.3425C13.1707 30.173 13.0484 29.962 12.9855 29.7306C12.9227 29.4992 12.9215 29.2553 12.982 29.0233L14.8153 22.0053C14.8702 21.7951 14.971 21.5997 15.1105 21.4333L32.0267 4.5281C32.2845 4.27061 32.634 4.12598 32.9983 4.12598C33.3627 4.12598 33.7122 4.27061 33.97 4.5281L39.1565 9.71277C39.2206 9.7803 39.2794 9.85262 39.3325 9.9291ZM36.2397 10.6844L32.9983 7.44493L17.382 23.0613L16.2362 27.4484L20.6233 26.3026L36.2397 10.6844Z" fill="white"/>
                <path d="M36.0092 31.4601C36.5103 27.1774 36.6703 22.8616 36.4877 18.5535C36.4834 18.4519 36.5002 18.3506 36.5371 18.2559C36.5741 18.1613 36.6303 18.0753 36.7022 18.0035L38.5062 16.1995C38.5555 16.1499 38.618 16.1156 38.6863 16.1007C38.7547 16.0859 38.8258 16.091 38.8913 16.1156C38.9567 16.1402 39.0136 16.1832 39.0553 16.2394C39.0969 16.2955 39.1214 16.3625 39.1258 16.4323C39.4645 21.5496 39.3356 26.6871 38.7408 31.781C38.3082 35.488 35.3308 38.3938 31.6403 38.8063C25.2335 39.5154 18.7679 39.5154 12.361 38.8063C8.67234 38.3938 5.69318 35.488 5.26051 31.781C4.50171 25.2825 4.50171 18.7178 5.26051 12.2193C5.69318 8.51231 8.67051 5.60647 12.361 5.19397C17.2238 4.65689 22.123 4.52628 27.0075 4.80347C27.0774 4.80849 27.1444 4.83344 27.2006 4.87536C27.2567 4.91728 27.2997 4.97442 27.3244 5.04001C27.3491 5.1056 27.3545 5.17689 27.3399 5.24544C27.3253 5.314 27.2914 5.37694 27.2422 5.42681L25.4217 7.24547C25.3505 7.31669 25.2654 7.37249 25.1717 7.40939C25.0781 7.4463 24.9778 7.46351 24.8772 7.45997C20.8012 7.32037 16.7205 7.47661 12.6672 7.92747C11.4827 8.05857 10.3771 8.58513 9.52879 9.4221C8.68051 10.2591 8.13916 11.3576 7.99218 12.5401C7.25675 18.8254 7.25675 25.1749 7.99218 31.4601C8.13916 32.6427 8.68051 33.7412 9.52879 34.5782C10.3771 35.4151 11.4827 35.9417 12.6672 36.0728C18.818 36.7603 25.1833 36.7603 31.336 36.0728C32.5204 35.9417 33.6261 35.4151 34.4744 34.5782C35.3227 33.7412 35.8622 32.6427 36.0092 31.4601Z" fill="white"/>
                </svg>
            </div>           

            <div className="flex items-center justify-start gap-20 mx-6 mt-8 mb-8">
                <div>
                    <h3 className="text-base">KAIC Rating</h3>
                    <h2 className="font-semibold text-lg">-</h2>
                </div>
                <div className="ml-8">
                    <h3 className="text-base">Current Rating</h3>
                    <h2 className="font-semibold text-lg flex items-center gap-4 ">-</h2>
                </div>
                <div className="ml-22">
                    <h3 className="text-base">Voltage Rating</h3>
                    <h2 className="font-semibold text-lg">-</h2>
                </div>               
                <div className="ml-14">
                    <h3 className="text-base">Phase/Wire</h3>
                    <h2 className="font-semibold text-lg">-</h2>
                </div>               
            </div>
            <div className="flex items-center justify-start gap-20 mx-6 mt-8 mb-8">
                <div>
                    <h3 className="text-base">kW/kVA Rating</h3>
                    <h2 className="font-semibold text-lg">-</h2>
                </div>
                <div className="ml-3">
                    <h3 className="text-base">Main breaker size</h3>
                    <h2 className="font-semibold text-lg flex items-center gap-4 ">-</h2>
                </div>
                <div className="ml-17">
                    <h3 className="text-base">RPM</h3>
                    <h2 className="font-semibold text-lg">-</h2>
                </div>               
                <div className="ml-32">
                    <h3 className="text-base">HP</h3>
                    <h2 className="font-semibold text-lg">-</h2>
                </div>               
            </div>
            <div className="flex items-center justify-start gap-20 mx-6 mt-8 mb-8">
                <div>
                    <h3 className="text-base">CFM</h3>
                    <h2 className="font-semibold text-lg">-</h2>
                </div>
                <div className="ml-22">
                    <h3 className="text-base">Tonnage</h3>
                    <h2 className="font-semibold text-lg flex items-center gap-4 ">-</h2>
                </div>                              
            </div>
        </div>
        
        {/* texet area */}
        <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy  mt-8 rounded-2xl card">
            
            <div className="flex items-center gap-4 border-b-[0.5px] border-[#E5E5EC6E] px-6 pt-6">
                <h3 className="text-[#5B5A64] text-lg font-medium">Emails</h3>
                <h3 className="border-b-2 border-[#00E691] text-white text-lg font-medium">
                Notes
                </h3>
                <h3 className="text-[#5B5A64] text-lg font-medium">Attachments</h3>
                <h3 className="text-[#5B5A64] text-lg font-medium">Connected Records</h3>
                <h3 className="text-[#5B5A64] text-lg font-medium">Reports</h3>
            </div>
            
            <div className="px-6 pb-6">
                <div className="flex items-center justify-between mt-8">
                    <h3>Important Notes</h3>
                </div>
                <textarea
                    type="text"
                    placeholder="Write your note here"
                    className="w-full h-60 font-medium bg-transparent text-white placeholder-gray-500 pl-4 py-4 mt-6 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
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