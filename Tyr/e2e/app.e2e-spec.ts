import { TestNgcliPage } from './app.po';

describe('test-ngcli App', function() {
  let page: TestNgcliPage;

  beforeEach(() => {
    page = new TestNgcliPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
