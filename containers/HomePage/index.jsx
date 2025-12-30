"use client";
import { useState, useEffect } from "react";

import TailwindDialog from "../../components/common/Modals/SearchModal";
import CongratsCard from "../../components/Cards/congratsCard";
import SalesCard from "../../components/Cards/SalesCards";
import RevenueCard from "../../components/Cards/RevenueCard";
import ProfileReportCard from "../../components/Cards/ProfileReport";
import OrderStatisticsCard from "../../components/Cards/OrderStatisticsCard";
import IncomeOverviewCard from "../../components/Cards/IncomeOverviewCard";
import ActivityTimelineCard from "../../components/Cards/ActivityTimelineCard";
import TransactionCard from "../../components/Cards/TransactionCard";
import { getUser } from "../../services/instance/tokenService";

// Mock data (replace with actual data fetching in a real app)
const orderStatsData = {
  title: "Order Statistics",
  totalSales: "42.82K",
  totalOrders: 8258,
  weeklyPercentage: 38,
  categories: [
    { name: "Electronic", description: "Mobile, Earbuds, TV", value: "82.5K" },
    { name: "Fashion", description: "T-shirt, Jeans, Shoes", value: "23.8K" },
    { name: "Decor", description: "Fine Art, Dining", value: "849" },
    { name: "Sports", description: "Football, Cricket Kit", value: "99" },
  ],
};

const incomeData = {
  totalBalance: "459.10",
  balanceChange: "42.9", // percentage
  chartData: [10, 30, 80, 50, 90, 60, 100], // Example data for the simplified chart
  incomeThisWeek: 965,
  incomeComparison: "39K less than last week",
};

const transactionsData = {
  title: "Transactions",
  transactions: [
    {
      type: "Paypal",
      description: "Send money",
      amount: "+82.6",
      currency: "USD",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      icon: "P",
    },
    {
      type: "Wallet",
      description: "Mac'D",
      amount: "+270.69",
      currency: "USD",
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
      icon: "W",
    },
    {
      type: "Transfer",
      description: "Refund",
      amount: "+637.91",
      currency: "USD",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      icon: "T",
    },
    {
      type: "Credit Card",
      description: "Ordered Food",
      amount: "-838.71",
      currency: "USD",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500",
      icon: "C",
    },
    {
      type: "Wallet",
      description: "Starbucks",
      amount: "+203.33",
      currency: "USD",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-500",
      icon: "W",
    },
    {
      type: "Mastercard",
      description: "Ordered Food",
      amount: "-92.45",
      currency: "USD",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      icon: "M",
    },
  ],
};

const HomePage = () => {
  const [open, setOpen] = useState(false);

  // CTRL + K listener
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleClose = (val) => setOpen(val);

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-5">
        <CongratsCard user={JSON.parse(getUser())} />
        {/* <StatsCards /> */}
      </div>

      <div className="flex items-cenmter gap-5 w-full px-5 pt-5">
        <RevenueCard />
        <ProfileReportCard />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 px-5 gap-5 pt-5">
        <OrderStatisticsCard data={orderStatsData} />
        <IncomeOverviewCard data={incomeData} />
        <TransactionCard data={transactionsData} />
      </div>

      <div className="grid grid-cols-12 gap-6 px-5 pt-5">
        <ActivityTimelineCard className="col-span-12 lg:col-span-6" />
        {/* <TrafficStatsCard className="col-span-12 lg:col-span-6" /> */}
      </div>

      {open && <TailwindDialog open={open} setOpen={handleClose} />}
    </div>
  );
};

export default HomePage;
