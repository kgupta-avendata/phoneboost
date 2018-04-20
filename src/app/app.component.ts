import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';

@Component({
  	templateUrl: 'app.html'
})
export class MyApp {
	rootPage:any = HomePage;
	showSplash = true;
	
	constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
		platform.ready().then(() => {
			statusBar.styleDefault();
			splashScreen.hide();

			setTimeout(() => {
				this.showSplash = false;
			}, 500);
		});
	}
}

