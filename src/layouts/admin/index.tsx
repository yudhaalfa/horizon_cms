import { Portal, Box, useDisclosure } from '@chakra-ui/react';
import Footer from 'components/footer/FooterAdmin';
import Navbar from 'components/navbar/NavbarAdmin';
import { SidebarContext } from 'contexts/SidebarContext';
import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import routes from 'routes';

export default function Dashboard(props: { [x: string]: any }) {
  const { ...rest } = props;

  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);



  const currentLayout = window.location.pathname.startsWith('/merchant')
    ? '/merchant'
    : '/admin';


  const getRoute = () => {
    return window.location.pathname !== `${currentLayout}/full-screen-maps`;
  };

  const getActiveRoute = (routes: any[]): string => {
    let activeRoute = 'Default Brand Text';
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].name;
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routes: any[]): boolean => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };

  const getActiveNavbarText = (routes: any[]): string | boolean => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].name;
      }
    }
    return activeNavbar;
  };

  const getRoutes = (routes: any[]): any => {
    return routes.map((route: any, key: any) => {
      if (route.layout === currentLayout) {
        return (
          <Route path={`${route.path}`} element={route.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = 'ltr';
  const { onOpen } = useDisclosure();

  return (
    <Box>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}
      >
        <Box
          float="right"
          minHeight="100vh"
          height="100%"
          overflow="auto"
          position="relative"
          maxHeight="100%"
          w="100%"
          maxWidth="100%"
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          <Portal>
            <Box>
              <Navbar
                onOpen={onOpen}
                brandText={getActiveRoute(routes)}
                secondary={getActiveNavbar(routes)}
                message={getActiveNavbarText(routes)}
                fixed={fixed}
                {...rest}
              />
            </Box>
          </Portal>

          {getRoute() ? (
            <Box
              mx="auto"
              p={{ base: '20px', md: '30px' }}
              pe="20px"
              minH="100vh"
              pt="50px"
            >
              <Routes>
                {getRoutes(routes)}
                <Route
                  path="/"
                  element={<Navigate to={`${currentLayout}/default`} replace />}
                />
              </Routes>
            </Box>
          ) : null}
          <Box>
            <Footer />
          </Box>
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}
