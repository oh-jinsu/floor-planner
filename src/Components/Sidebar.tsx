import {
    MdOutlineChair,
    MdOutlineDoorFront,
    MdOutlineHome,
} from "react-icons/md";
import styles from "./Sidebar.module.css";
import { join } from "../Functions/Element";
import { ReactNode, useState } from "react";

export type SideBarState = {
    menus: {
        subject: string;
        icon: ReactNode;
        items: {
            icon: ReactNode;
            name: string;
        }[];
    }[];
    selected?: number;
};

const SideBar = () => {
    const [state, setState] = useState<SideBarState>({
        menus: [
            {
                subject: "구조물",
                icon: <MdOutlineDoorFront size={28} />,
                items: [
                    {
                        icon: <MdOutlineDoorFront size={30} />,
                        name: "문",
                    },
                ],
            },
            {
                subject: "가구",
                icon: <MdOutlineChair size={30} />,
                items: [],
            },
            {
                subject: "템플릿",
                icon: <MdOutlineHome size={28} />,
                items: [],
            },
        ],
    });

    const onMenuButtonClicked = (i: number) => {
        setState((state) => ({
            ...state,
            selected: i === state.selected ? undefined : i,
        }));
    };

    const { menus, selected } = state;

    return (
        <aside className={styles.container}>
            <ul className={styles.menus}>
                {menus.map(({ icon }, i) => (
                    <li key={i.toString()}>
                        <button
                            className={join(
                                styles.button,
                                i === selected && "active"
                            )}
                            onClick={() => onMenuButtonClicked(i)}
                        >
                            {icon}
                        </button>
                    </li>
                ))}
            </ul>
            {selected !== undefined && (
                <div className={styles.scroll}>
                    <h3 className={styles.subject}>
                        {state.menus[selected].subject}
                    </h3>
                    <ul className={styles.items}>
                        {state.menus[selected].items.map(
                            ({ icon, name }, i) => (
                                <li key={i.toString()} className={styles.item}>
                                    <button className={styles.figure}>
                                        {icon}
                                    </button>
                                    <h4 className={styles.name}>{name}</h4>
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}
        </aside>
    );
};

export default SideBar;
