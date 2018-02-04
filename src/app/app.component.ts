import { Component, ViewChild } from '@angular/core';
import { MenuController, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FlutterService } from './services/flutter';
import { HomePage } from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { NotificationService } from './services/notification';

@Component({
  templateUrl: 'app.html'
})
export class FlutterApp {

  @ViewChild(Nav) public nav: Nav;

  public rootPage: any = HomePage;
  public pages: Array<{ title: string, component: any }> = [
    { title: 'Profit', component: HomePage },
    { title: 'About', component: AboutPage },
  ];

  private menu: MenuController;
  private flutter: FlutterService;
  private notification: NotificationService;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, menu: MenuController, flutter: FlutterService, notification: NotificationService) {

    this.menu = menu;
    this.flutter = flutter;
    this.notification = notification;
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      splashScreen.hide();
    })
      .then(() => this.notification.init());
  }

  public openPage(page: any): void {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
