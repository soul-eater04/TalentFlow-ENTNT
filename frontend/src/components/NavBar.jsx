import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "./ui/navigation-menu";
import { ModeToggle } from "./ModeToggle";
import { Home, Briefcase, Users } from "lucide-react";

const NavBar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/jobs", label: "Jobs", icon: Briefcase },
    { path: "/candidates", label: "Candidates", icon: Users },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TalentFlow
            </span>
          </Link>

          {/* Navigation Links */}
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <NavigationMenuItem key={item.path}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.path}
                        className={`
                          relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                          flex items-center gap-2
                          ${
                            active
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }
                        `}
                      >
                        {/* Active indicator */}
                        {active && (
                          <span className="absolute inset-0 bg-primary/10 rounded-lg"></span>
                        )}

                        {/* Icon */}
                        <Icon
                          className={`
                            w-4 h-4 relative z-10 transition-transform duration-200
                            ${active ? "scale-110" : ""}
                          `}
                        />

                        {/* Label */}
                        <span className="relative z-10">{item.label}</span>

                        {/* Hover effect */}
                        {!active && (
                          <span className="absolute inset-0 bg-accent rounded-lg opacity-0 transition-opacity"></span>
                        )}

                        {/* Active underline */}
                        {active && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></span>
                        )}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mode Toggle */}
          <div className="flex items-center">
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
