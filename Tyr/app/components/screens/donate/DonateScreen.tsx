import * as React from 'react';
import { IComponentProps } from '#/components/IComponentProps';
import { GOTO_PREV_SCREEN } from '#/store/actions/interfaces';
import { TopPanel } from '#/components/general/top-panel/TopPanel';
import './page-donate.css';
// @ts-expect-error
import donate from '#/img/donate.jpg';

export class DonateScreen extends React.PureComponent<IComponentProps> {
  private onBackClick() {
    const { dispatch } = this.props;
    dispatch({ type: GOTO_PREV_SCREEN });
  }

  render() {
    return (
      <div className='flex-container page-donate'>
        <div className='flex-container__content'>
          <TopPanel onBackClick={this.onBackClick.bind(this)} />
          <div className='page-donate__meme'>
            <img src={donate} alt='' />
          </div>
          <div className='page-donate__disclaimer'>
            Пантеон существует на голом энтузиазме, но разработчики никогда не откажутся от
            дополнительных средств на его содержание :)
          </div>
          <div className='page-donate__button'>
            <a
              className='flat-btn flat-btn--large'
              style={{ width: '100%' }}
              href='https://pay.cloudtips.ru/p/c9fd6eee'
              target='_blank'
            >
              Внести свою копеечку
            </a>
          </div>
        </div>
      </div>
    );
  }
}
