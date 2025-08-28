import { AuthUser } from "@/stores/api/authApiSlice";
import { selectCurrentUser } from "@/stores/slices/userSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const useRoleNavigation = () => {
    const user = useSelector(selectCurrentUser);
    const navigate = useNavigate();
    const userRole=user?.Role?.roleName
    console.log(user,"user")
    console.log(userRole,"role")
  const roleNavigate = (path:string) => {
    // Ensure no duplicate slashes
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    navigate(`/${userRole}/${cleanPath}`);
  };

  return roleNavigate;
};

export default useRoleNavigation;
