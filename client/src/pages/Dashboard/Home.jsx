import React, { useEffect, useState } from "react";
import {
  LuHandCoins,
  LuWalletMinimal,
  LuTrendingUp,
  LuPiggyBank,
} from "react-icons/lu";
import { IoMdCard } from "react-icons/io";
import { FiArrowUpRight, FiActivity } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  addThousandSeparator,
  calculatePercentageChange,
} from "../../utils/helper";
import RecentTransactions from "../../components/Dashboard/RecentTransactions";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import ExpenseTransactions from "../../components/Dashboard/ExpenseTransactions";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";
import RecentIncomeWithChart from "../../components/Dashboard/RecentIncomeWithChart";
import RecentIncome from "../../components/Dashboard/RecentIncome";

/* ---------- SHIMMER ---------- */
const shimmerEffect = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer-bg {
    animation: shimmer 1.5s infinite linear;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    background-size: 200% 100%;
  }
`;

const Home = () => {
  useUserAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* ---------- DYNAMIC PERCENTAGES ---------- */
  const incomeChange = calculatePercentageChange(
    dashboardData?.totalIncome,
    dashboardData?.prevTotalIncome
  );

  const expenseChange = calculatePercentageChange(
    dashboardData?.totalExpense,
    dashboardData?.prevTotalExpense
  );

  const balanceChange = calculatePercentageChange(
    dashboardData?.totalBalance,
    dashboardData?.prevTotalBalance
  );

  const savingsChange = calculatePercentageChange(
    (dashboardData?.totalIncome || 0) -
      (dashboardData?.totalExpense || 0),
    (dashboardData?.prevTotalIncome || 0) -
      (dashboardData?.prevTotalExpense || 0)
  );

  /* ---------- INFO CARD ---------- */
  const InfoCard = ({ icon, label, value, trend, loading, colorIndex }) => (
    <motion.div
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-3xl p-6 backdrop-blur-md bg-white/85 border border-white/30 shadow-2xl overflow-hidden"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div className="p-3.5 rounded-xl bg-white/95 shadow-lg">
            {icon}
          </div>
          {trend?.trend && (
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                trend.trend === "up"
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-rose-100 text-rose-900"
              }`}
            >
              {trend.trend === "up" ? "↑" : "↓"} {trend.value}%
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-gray-500 uppercase">
            {label}
          </p>
          {loading ? (
            <div className="h-9 w-2/3 mt-2 shimmer-bg rounded-lg" />
          ) : (
            <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
              ₹{value}
            </h3>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout activeMenu="Dashboard">
      <style>{shimmerEffect}</style>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <InfoCard
              icon={<IoMdCard className="w-7 h-7" />}
              label="Total Balance"
              value={addThousandSeparator(dashboardData?.totalBalance || 0)}
              trend={balanceChange}
              loading={loading}
            />
            <InfoCard
              icon={<LuWalletMinimal className="w-7 h-7" />}
              label="Total Income"
              value={addThousandSeparator(dashboardData?.totalIncome || 0)}
              trend={incomeChange}
              loading={loading}
            />
            <InfoCard
              icon={<LuHandCoins className="w-7 h-7" />}
              label="Total Expenses"
              value={addThousandSeparator(dashboardData?.totalExpense || 0)}
              trend={expenseChange}
              loading={loading}
            />
            <InfoCard
              icon={<FiArrowUpRight className="w-7 h-7" />}
              label="Net Savings"
              value={addThousandSeparator(
                (dashboardData?.totalIncome || 0) -
                  (dashboardData?.totalExpense || 0)
              )}
              trend={savingsChange}
              loading={loading}
            />
          </div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Home;