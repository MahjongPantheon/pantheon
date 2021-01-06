import * as React from "react";
import './page-set-hand.css'
import {NumberSelect} from '#/components/general/number-select/NumberSelect';

type IProps = {
    yakuHan: number
    doraCount: number
    uraDoraCount: number
    fuCount: number
    redFivesCount?: number
    withRedFives?: boolean
    doraValues: number[]
    uraDoraValues: number[]
    redFivesValues: number[]
    fuValues: number[]
}

export class SelectTotalPanel extends React.Component<IProps> {

    private get hanCount(): number {
        const {yakuHan, doraCount, uraDoraCount, redFivesCount = 0} = this.props;
        return yakuHan + doraCount + uraDoraCount + redFivesCount
    }

    render() {
        const {
            yakuHan,
            doraCount,
            doraValues,
            uraDoraCount,
            uraDoraValues,
            redFivesCount,
            withRedFives,
            redFivesValues,
            fuCount,
            fuValues,
        } = this.props;

        return (
            <div className="select-total-panel">
                <div className="select-total-panel__top-group">
                    Han from yaku <span>{yakuHan}</span>
                </div>
                <div className="select-total-panel__max">
                    <div className="select-total-panel__select-group">
                        <div className="select-total-panel__select-group-caption">
                            Dora
                        </div>
                        <NumberSelect value={doraCount} possibleValues={doraValues} onChange={() => {}}/>
                    </div>
                    <div className="select-total-panel__select-group">
                        <div className="select-total-panel__select-group-caption">
                            Ura dora
                        </div>
                        <NumberSelect value={uraDoraCount} possibleValues={uraDoraValues} onChange={() => {}}/>
                    </div>
                    {withRedFives && redFivesCount !== undefined && (
                        <div className="select-total-panel__select-group">
                            <div className="select-total-panel__select-group-caption">
                                Red fives
                            </div>
                            <NumberSelect value={redFivesCount} possibleValues={redFivesValues} onChange={() => {}}/>
                        </div>
                    )}
                    <div className="select-total-panel__select-group">
                        <div className="select-total-panel__select-group-caption">
                            Fu
                        </div>
                        <NumberSelect value={fuCount} possibleValues={fuValues} onChange={() => {}}/>
                    </div>
                </div>
                <div className="select-total-panel__bottom-group">
                    {this.hanCount} han {fuCount} fu
                </div>

            </div>
        );
    }
}
