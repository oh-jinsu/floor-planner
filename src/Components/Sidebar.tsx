import {
    MdOutlineChair,
    MdOutlineDoorFront,
    MdOutlineHome,
    MdOutlineWindow,
} from "react-icons/md";
import styles from "./Sidebar.module.css";
import { join } from "../Functions/Common/Element";
import { ReactNode, useContext, useState } from "react";
import { EditorContext } from "./Editor";
import { GrabbingObject } from "../Types/GrabbingObject";

type HoldingObjectId = GrabbingObject["id"];

export type SideBarState = {
    menus: {
        subject: string;
        icon: ReactNode;
        items: {
            id: HoldingObjectId;
            src: string;
            name: string;
        }[];
    }[];
    selected?: number;
};

const SideBar = () => {
    const { setHoldingObject } = useContext(EditorContext);

    const [state, setState] = useState<SideBarState>({
        menus: [
            {
                subject: "문",
                icon: <MdOutlineDoorFront size={28} />,
                items: [
                    {
                        id: "door",
                        src: "/images/door.jpg",
                        name: "여닫이문",
                    },
                ],
            },
            {
                subject: "창문",
                icon: <MdOutlineWindow size={28} />,
                items: [
                    {
                        id: "window",
                        src: "/images/window.png",
                        name: "미서기창",
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

    const onItemDragStart = (id: HoldingObjectId) => {
        switch (id) {
            case "door":
                setHoldingObject({
                    id,
                    length: 1000,
                });

                break;
            case "window":
                setHoldingObject({
                    id,
                    length: 2000,
                });
                break;
        }
    };

    const { menus, selected } = state;

    return (
        <aside className={styles.container}>
            <ul className={styles.menus}>
                {menus.map(({ icon, subject }, i) => (
                    <li key={i.toString()}>
                        <button
                            className={join(
                                styles.button,
                                i === selected && "active"
                            )}
                            onClick={() => onMenuButtonClicked(i)}
                        >
                            {icon}

                            <span>{subject}</span>
                        </button>
                    </li>
                ))}
            </ul>
            {selected !== undefined && (
                <div className={styles.scroll}>
                    <h3 className={styles.subject}>
                        {state.menus[selected].subject}
                    </h3>
                    {state.menus[selected].items.length === 0 ? (
                        <p className={styles.notice}>자료가 없습니다.</p>
                    ) : (
                        <ul className={styles.items}>
                            {state.menus[selected].items.map(
                                ({ id, src, name }) => (
                                    <li key={id} className={styles.item}>
                                        <button
                                            className={styles.button}
                                            onMouseDown={() =>
                                                onItemDragStart(id)
                                            }
                                        >
                                            <img src={src} alt={name} />
                                        </button>
                                        <h4 className={styles.name}>{name}</h4>
                                    </li>
                                )
                            )}
                        </ul>
                    )}
                </div>
            )}
        </aside>
    );
};

export default SideBar;
