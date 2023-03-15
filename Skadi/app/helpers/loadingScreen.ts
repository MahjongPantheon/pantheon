import { ILoadingScreen } from '@babylonjs/core/Loading/loadingScreen';

export class LoadingScreen implements ILoadingScreen {
  private _div: HTMLDivElement;
  constructor() {
    this._div = window.document.getElementById('loadingScreen')! as HTMLDivElement;
  }

  displayLoadingUI(): void {
    this._div.innerHTML = this.loadingUIText;
  }

  hideLoadingUI(): void {
    this._div.style.display = 'none';
  }

  loadingUIBackgroundColor: string = '#000';
  loadingUIText: string = 'Loading...';
}
