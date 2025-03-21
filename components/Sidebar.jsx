import { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  X, 
  Menu, 
  FileText, 
  PiggyBank, 
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Package,
  LogOut,
  ChevronDown,
  ChevronRight,
  BriefcaseMedical,
  ClipboardList,
  Lock,
  CircleUserRound,
  BookUser
} from 'lucide-react';

// Function to create navigation items based on user role and subscription plan
const createNavigationItems = (tenant, userRole, planType) => {
  // Default items for all users (doctor, user)
  const medicalItems = {
    icon: <BriefcaseMedical size={20} />,
    label: "Médico",
    subItems: [
      { icon: <Calendar size={20} />, label: "Agendamentos", path: `/${tenant}/appointments` },
      { icon: <Stethoscope size={20} />, label: "Gestão de Procedimentos", path: `/${tenant}/procedures` },
    ]
  };

  // Add Patients page only for doctor, admin, and owner roles AND if not on starter plan
  if (userRole !== 'user' && planType !== 'starter') {
    medicalItems.subItems.push(
      { icon: <BookUser size={20} />, label: "Pacientes", path: `/${tenant}/patients` }
    );
  }

  // Items only for admin and owner
  const financialItems = {
    icon: <PiggyBank size={20} />, 
    label: "Financeiro",
    subItems: [
      { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: `/${tenant}/financeiro` },
      { icon: <FileText size={20} />, label: "Despesas", path: `/${tenant}/despesas` },
      { icon: <PiggyBank size={20} />, label: "Receitas", path: `/${tenant}/receitas` }
    ]
  };

  const managementItems = {
    icon: <ClipboardList size={20} />,
    label: "Gestão",
    subItems: [
      // Only show stock management for plus plan
      ...(planType === 'plus' ? [
        { 
          icon: <Package size={20} />, 
          label: "Gestão de Estoque", 
          path: `/${tenant}/stock`
        }
      ] : []),
      // Show user management for all plans
      { 
        icon: <CircleUserRound size={20} />, 
        label: "Gestão de Usuários", 
        path: `/${tenant}/users`
      }
    ]
  };

  // Return different navigation items based on role and plan
  if (userRole === 'admin' || userRole === 'owner') {
    return [financialItems, medicalItems, managementItems];
  } else {
    // For user and doctor roles, only show medical section
    return [medicalItems];
  }
};

export default function Sidebar({ user, onLogout, onLoadingChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const tenant = params?.tenant;

  const [isSidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [openSections, setOpenSections] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('openSections');
      return saved !== null ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [planType, setPlanType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationItems, setNavigationItems] = useState([]);

  // Fetch user role and subscription plan if not provided in props
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Fetch user role if not provided in props
        if (!user?.role) {
          const roleResponse = await fetch(`/api/${tenant}/auth/verify-role`);
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            setUserRole(roleData.role);
          }
        } else {
          setUserRole(user.role);
        }
        
        // Fetch subscription data
        const subscriptionResponse = await fetch(`/api/${tenant}/subscription`);
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json();
          setPlanType(subscriptionData.planType || 'plus');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
        // Notify parent component about loading state change
        if (onLoadingChange) {
          onLoadingChange(false);
        }
      }
    };

    if (tenant) {
      fetchUserData();
    }
  }, [tenant, user, onLoadingChange]);

  // Update navigation items when role or plan changes
  useEffect(() => {
    if (tenant && userRole && planType) {
      setNavigationItems(createNavigationItems(tenant, userRole, planType));
    }
  }, [tenant, userRole, planType]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('openSections', JSON.stringify(openSections));
  }, [openSections]);

  const handleNavClick = (item) => {
    if (item.isLocked) {
      setIsModalOpen(true);
      return;
    }
    router.push(item.path);
    if (isMobile) setSidebarOpen(false);
  };

  const toggleSection = (label) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Implement logout function if not provided as prop
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        router.push(`/${tenant}/login`);
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!tenant || isLoading || !userRole || !planType) {
    return (
      <div className="bg-white dark:bg-gray-800 h-screen w-64 min-w-[16rem] border-r border-gray-200 dark:border-gray-700">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#009EE3] text-white rounded-full p-2 shadow-lg hover:bg-[#0080B7]"
      >
        <Menu size={24} />
      </button>

      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Funcionalidade em desenvolvimento</DialogTitle>
          </DialogHeader>
          <p>Esta funcionalidade ainda não está disponível</p>
        </DialogContent>
      </Dialog>

      <aside
        className={`
          bg-white dark:bg-gray-800 h-screen
          ${isMobile 
            ? 'fixed left-0 top-0 z-40 w-[280px] shadow-lg transition-transform duration-300 ease-in-out ' + 
              (isSidebarOpen ? 'translate-x-0' : '-translate-x-full')
            : 'relative w-64 min-w-[16rem] border-r border-gray-200 dark:border-gray-700'
          }
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <a href={`/${tenant}`}>
              <h2 className="font-bold text-xl text-[#009EE3] dark:text-[#009EE3]">
                Live Plus
              </h2>
            </a>
            <div className="flex flex-col mt-1">
              {user?.email && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                Perfil: {userRole}
              </p>
            </div>
          </div>
          <nav className="flex-1 pt-6 px-2 space-y-2 overflow-y-auto">
            {navigationItems.map((section) => (
              <div key={section.label}>
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-3 justify-between px-3 py-2 rounded-lg"
                  onClick={() => toggleSection(section.label)}
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span>{section.label}</span>
                  </div>
                  {openSections[section.label] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </Button>
                {openSections[section.label] && (
                  <div className="pl-6 space-y-2">
                    {section.subItems.map((item) => (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className={`w-full flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all duration-200
                          ${item.isLocked 
                            ? 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' 
                            : pathname === item.path
                              ? 'bg-[#009EE3]/10 dark:bg-[#009EE3]/20 text-[#009EE3] dark:text-[#009EE3] hover:bg-[#009EE3]/20 dark:hover:bg-[#009EE3]/30' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }
                        `}
                        onClick={() => handleNavClick(item)}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                          {item.secondaryIcon}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 justify-start px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={onLogout || handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}