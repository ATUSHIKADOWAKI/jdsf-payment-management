import React, { CSSProperties } from 'react'
import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { NavLink } from 'react-router-dom';

interface SidebarProps {
    drawerWidth: number,
    mobileOpen: boolean,
    handleDrawerToggle: () => void,
}

interface menuItem {
    text: string,
    path: string,
}

const SideBar = ({ drawerWidth, mobileOpen, handleDrawerToggle }: SidebarProps) => {
    const MenuItems: menuItem[] = [
        { text: "精算履歴", path: "/dashboard/history" },
        { text: "精算入力", path: "/dashboard/payment" },
        { text: "アカウント設定", path: "/dashboard/account" },
        { text: "ログアウト", path: "/" },
    ]

    const baseLinkStyle: CSSProperties = {
        textDecoration: "none",
        color: 'inherit',
        display: "block"
    }

    const activeLinkStyle: CSSProperties = {
        backgroundColor: "rgba(0,0,0,0.08)"
    }

    const drawer = (
        <div>
            <Toolbar sx={{ backgroundColor: "#1976d2", color: "white" }} >JDSF BREAKING 精算
            </Toolbar>
            <Divider />
            <List>
                {MenuItems.map((item, index) => (
                    <NavLink key={item.text} to={item.path} style={({ isActive }) => {
                        return {
                            ...baseLinkStyle,
                            ...(isActive ? activeLinkStyle : {})
                        }
                    }}>
                        <ListItem key={index} disablePadding>
                            <ListItemButton>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    </NavLink>
                ))}
            </List>
        </div >
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            aria-label="mailbox folders"
        >

            {/* モバイル用 */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, 
                }}
                sx={{
                    display: { xs: 'block', sm: 'block', md: 'none' }, // 900px未満ではモバイルメニューを使う
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawer}
            </Drawer>
            {/* PC用 */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    )
}

export default SideBar