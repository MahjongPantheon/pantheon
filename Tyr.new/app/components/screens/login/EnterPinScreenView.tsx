import * as React from "react";
import './page-enter-pin.css'

type IProps = {
    onSubmit: (pin: string) => void
}

type IState = {
    pin: string
}

type buttonItem = {
    caption: string | number
    onClick: () => void
}

export class EnterPinScreenView extends React.PureComponent<IProps, IState> {
    private readonly buttons: buttonItem[];

    constructor(props: IProps) {
        super(props);

        this.state = {pin: ''};
        this.buttons = [];
        for (let i = 1; i <= 9; i++) {
            this.buttons.push({
                caption: i,
                onClick: () => this.onNumberClick(i)
            })
        }

        this.buttons.push({
            caption: '←',
            onClick: () => this.onClearClick(),
        });
        this.buttons.push({
            caption: 0,
            onClick: () => this.onNumberClick(0)
        });
        this.buttons.push({
            caption: 'Ok',
            onClick: () => this.props.onSubmit(this.state.pin),
        });
    }

    private onNumberClick(value: number) {
        this.setState({
            pin: this.state.pin + value.toString()
        })
    }

    private onClearClick() {
        if (this.state.pin.length) {
            this.setState({
                pin: this.state.pin.slice(0, this.state.pin.length - 1)
            })
        }
    }

    render() {
        const {pin} = this.state;

        return (
            <div className="page-enter-pin">
                <div className="page-enter-pin__title">
                    Pantheon
                </div>

                <div className="page-enter-pin__input">
                    <div className="page-enter-pin__input-group">
                        {!!pin && (
                            <div className="page-enter-pin__number">
                                {pin}
                            </div>
                        )}
                        {!pin && (
                            <div className="page-enter-pin__placeholder">
                                enter pin code
                            </div>
                        )}

                        <div className="page-enter-pin__qr svg-button">
                            <svg>
                                <use xlinkHref="#qr" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="page-enter-pin__button-container">
                    {this.buttons.map(button => (
                        <div key={button.caption}
                             className="page-enter-pin__button flat-btn"
                             onClick={button.onClick}
                        >
                            {button.caption}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
