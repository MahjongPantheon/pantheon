import * as React from "react";
import './page-setting.css'
import {Switch} from '#/components/general/switch/Switch';
import {TopPanel} from '#/components/general/top-panel/TopPanel';

interface IProps {
  onLogOut?: () => void
}

export const SettingsScreen = React.memo(function SettingsScreen(props: IProps) {
  const {onLogOut} = props;

  return (
    <div className="flex-container page-setting">
      <div className="flex-container__content">
        <TopPanel/>
        <div className="page-setting__name">Super long long long name</div>
        <div className="page-setting__section">
          <div className="page-setting__section-title">Language</div>
          <div className="page-setting__section-content">
            <div className="radio-btn radio-btn--rounded radio-btn--small radio-btn--active">En</div>
            <div className="radio-btn radio-btn--rounded radio-btn--small">Ru</div>
          </div>
        </div>
        <div className="page-setting__section">
          <div className="page-setting__section-title">Theme</div>
          <div className="page-setting__section-content">
            <div className="theme theme--selected">
              <div className="theme__visual">
                <div className="theme__visual-inner" style={{backgroundColor: "#F4F5F7"}}>
                  <div className="theme__secondary-color" style={{backgroundColor: "#B8C0D1"}}></div>
                  <div className="theme__text-color" style={{backgroundColor: "#000000"}}></div>
                  <div className="theme__primary-color" style={{backgroundColor: "#1565C0"}}></div>
                </div>
              </div>
              <div className="theme__name">Day</div>
            </div>
            <div className="theme">
              <div className="theme__visual">
                <div className="theme__visual-inner" style={{backgroundColor: "#282C34"}}>
                  <div className="theme__secondary-color" style={{backgroundColor: "#37445C"}}></div>
                  <div className="theme__text-color" style={{backgroundColor: "#E6E6E6"}}></div>
                  <div className="theme__primary-color" style={{backgroundColor: "#1565C0"}}></div>
                </div>
              </div>
              <div className="theme__name">Night</div>
            </div>
          </div>
        </div>
        <div className="page-setting__section">
          <div className="switch-setting">
            <Switch switched={false} onToggle={() => {
            }}/>
            <div className="switch-setting__description">
              <div className="switch-setting__caption">Single device mode</div>
              <div className="switch-setting__info">Turn on if you use one device on table during the game</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-container__bottom page-setting__bottom" onClick={onLogOut}>
        <div className="link">Log out</div>
      </div>
    </div>
  );
})
