"use client";

import { Tabs, Tab, TabsOwnProps } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import Image from "next/image";
import { OhmDetailsTab, OhmsDataType } from "../../types/globalTypes";

// outside the component
function CloneProps(props) {
  const { children, ...other } = props;
  return children(other);
}

export type ElementDetailsTabsProps = {
  ohm: OhmsDataType;
  tabs: OhmDetailsTab[];
  orientation: TabsOwnProps["orientation"];
};

const OhmDetailsTabs = ({ ohm, tabs, orientation }: ElementDetailsTabsProps) => {
  const pathname = usePathname();
  const currentTab = pathname.substring(pathname.lastIndexOf("/") + 1);

  const [value, setValue] = React.useState(currentTab);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  // Sync value to route when currentTab changes
  // Could we move this to a location where it has access to the route through layout params?
  React.useLayoutEffect(() => {
    setValue(currentTab);
  }, [currentTab]);

  const verticalTabs = orientation === "vertical";

  return (
    <>
      <Tabs
        value={value}
        onChange={handleTabChange}
        aria-label="Tabs"
        orientation={orientation}
        allowScrollButtonsMobile
        slotProps={{
          startScrollButtonIcon: { className: "start-scroll-icon" },
          endScrollButtonIcon: { className: "end-scroll-icon" },
        }}
        variant="scrollable"
        sx={{
          "& .MuiTab-root.Mui-selected": {
            backgroundColor: verticalTabs ? "rgba(73, 77, 107, .15)" : "initial",
          },
          "& .MuiTabs-scrollButtons.Mui-disabled": {
            opacity: 0.3,
          },
          "&.MuiTabs-root:has(.MuiTabScrollButton-root:not(.Mui-disabled) .start-scroll-icon)  .MuiTabs-scroller": {
            // Start edge blur (left/top)
            "&::before": {
              content: '""',
              position: "fixed",
              zIndex: 1,
              pointerEvents: "none",
              ...(orientation === "horizontal"
                ? {
                    top: 0,
                    bottom: 0,
                    left: 40,
                    width: 15,
                    background: "linear-gradient(to right, #fff 0%, rgba(255,255,255,0.8) 25%, transparent 100%)",
                  }
                : {
                    left: 0,
                    right: 0,
                    top: 40,
                    height: 15,
                    background: "linear-gradient(to bottom, #F2F2F2 0%, rgba(255,255,255,0.8) 25%, transparent 100%)",
                  }),
            },
          },
          "&.MuiTabs-root:has(.MuiTabScrollButton-root:not(.Mui-disabled) .end-scroll-icon)  .MuiTabs-scroller": {
            // End edge blur (right/bottom)
            "&::after": {
              content: '""',
              position: "fixed",
              zIndex: 1,
              pointerEvents: "none",
              ...(orientation === "horizontal"
                ? {
                    top: 0,
                    bottom: 0,
                    right: 40,
                    width: 15,
                    background: "linear-gradient(to left, #fff 0%, rgba(255,255,255,0.8) 25%, transparent 100%)",
                  }
                : {
                    left: 0,
                    right: 0,
                    bottom: 40,
                    height: 15,
                    background: "linear-gradient(to top, #F2F2F2 0%, rgba(255,255,255,0.8) 25%, transparent 100%)",
                  }),
            },
          },
          contain: "layout",
          position: "sticky",
          top: "calc(var(--header-height, 64px) + var(--ohm-header-height, 48px))",
          width: verticalTabs ? 100 : "100%",
          maxHeight: "100%",
        }}
      >
        {tabs.map((tab) => {
          return (
            <CloneProps key={tab.route} value={tab.route}>
              {(tabProps) => (
                    <Tab
                      {...tabProps}
                      label={tab.label}
                      value={tab.route}
                      LinkComponent={Link}
                      href={`/ohm/${ohm}/${tab.route}`}
                      key={tab.route}
                      icon={
                        <Image
                          width={verticalTabs ? 50 : 40}
                          height={verticalTabs ? 50 : 40}
                          src={tab.iconPath}
                          alt={tab.label + " icon"}
                        />
                      }
                      sx={{ fontSize: "12px", width: "100%" }}
                    />
              )}
            </CloneProps>
          );
        })}
      </Tabs>
    </>
  );
};

export default OhmDetailsTabs;
