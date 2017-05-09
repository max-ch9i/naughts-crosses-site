import { NaughtsncrossesPage } from './app.po';

describe('naughtsncrosses App', () => {
  let page: NaughtsncrossesPage;

  beforeEach(() => {
    page = new NaughtsncrossesPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
