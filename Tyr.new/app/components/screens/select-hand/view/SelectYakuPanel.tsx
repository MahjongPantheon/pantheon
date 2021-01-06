import * as React from "react";
import './page-set-hand.css'
import {classNames} from '#/components/helpers/ReactUtils';
import {YakuGroup} from '#/components/screens/select-hand/YakuTypes';

type IProps = {
    yakuGroups: YakuGroup[]
}

export class SelectYakuPanel extends React.Component<IProps> {

    render() {
        const {yakuGroups} = this.props;

        return (
            <div className="select-yaku-panel">
                {yakuGroups.map((yakuGroup, i) => (
                    <div key={i} className="select-yaku-panel__group">
                        {yakuGroup.map((yaku, j) => (
                            <div key={j}
                                 className={classNames(
                                     'select-yaku-panel__button',
                                     {'select-yaku-panel__button--pressed': yaku.pressed},
                                     {'select-yaku-panel__button--disabled': yaku.disabled},
                                 )}
                                 onClick={yaku.onClick}
                            >
                                {yaku.name}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }
}
