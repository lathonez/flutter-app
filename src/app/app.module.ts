import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { FlutterApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { FlutterService } from './services/flutter';
import { NotificationService } from './services/notification';

@NgModule({
  declarations: [
    FlutterApp,
    AboutPage,
    HomePage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(FlutterApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    FlutterApp,
    AboutPage,
    HomePage,
  ],
  providers: [
    LocalNotifications,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FlutterService,
    NotificationService,
  ]
})
export class AppModule {}
