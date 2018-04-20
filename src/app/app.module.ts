import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { FinderPage } from '../pages/finder/finder';
import { InfoPage } from '../pages/info/info';
import { BatteryStatus } from '@ionic-native/battery-status';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing';
import { EmailComposer } from '@ionic-native/email-composer';
import { GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { HTTP } from '@ionic-native/http';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { NativeStorage } from '@ionic-native/native-storage';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AboutPage,
    FinderPage,
    InfoPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AboutPage,
    FinderPage,
    InfoPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BatteryStatus,
    LocalNotifications,
    Network,
    SocialSharing,
    EmailComposer,
    GoogleMaps,
    Geolocation,
    HTTP,
    LaunchNavigator,
    LocationAccuracy,
    NativeStorage,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}