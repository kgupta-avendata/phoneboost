import { Component } from '@angular/core';
import { NavController, Events, Platform, AlertController } from 'ionic-angular';
import { AboutPage } from '../about/about';
import { FinderPage } from '../finder/finder';
import { InfoPage } from '../info/info';
import { BatteryStatus } from '@ionic-native/battery-status';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Network } from '@ionic-native/network';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { NativeStorage } from '@ionic-native/native-storage';
import { StatusBar } from '@ionic-native/status-bar';
 
@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

	constructor(public navCtrl: NavController, public events: Events, public alertCtrl: AlertController, public platform: Platform, public batteryStatus: BatteryStatus, public localNotifications: LocalNotifications, public network: Network, public locationAccuracy: LocationAccuracy, public nativeStorage: NativeStorage, public statusBar: StatusBar) {
		this.platform.registerBackButtonAction((event)=>{
			this.platform.exitApp();
		});

		// let status bar overlay webview
		this.statusBar.overlaysWebView(false);

		// set status bar to white
		this.statusBar.backgroundColorByHexString('#fff');

		if(!(this.nativeStorage.getItem('showBattryWaring') || !this.nativeStorage.getItem('showBattryWaring'))){
			alert('called');
			this.nativeStorage.setItem('showBattryWaring', true);
		}
  	}

	ionViewDidLoad() {
		this.batteryStatus.onChange().subscribe(status => {
			if(status.level >= 10) {
				this.localNotifications.schedule({
					id: 1,
					text: 'Low Battery ' + status.level + '% Get PhoneBoost Now',
					sound: null,
					data: { secret: "Notification" }
				});
			}
		});

		this.localNotifications.on('click', (notification, state) => {
			this.goToFinder(null);
		});
	}

	goToAbout(event) {
		this.navCtrl.push(AboutPage, {});
	}
	
	goToFinder(event) {
		if(this.checkInternetConnectivity()) {
			this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(r => {
				this.navCtrl.push(FinderPage, {});
			}, e=> {
				this.doAlert("Location Error!", "Please Check your location and try again!");
			});
		} else {
			this.doAlert("Network Error!", "Please Check your network and try again!");
		}
	}

	goToInfo(event) {
		this.navCtrl.push(InfoPage, {});
	}

	goToLink(event) {
		window.open("https://www.amazon.in/", '_system');
	}

	doAlert(title, message) {
		let alert = this.alertCtrl.create({
			title: title,
			message: message,
			buttons: ['Ok']
		});
		alert.present()
	}

	checkInternetConnectivity() {
		if(this.network.type !== 'none'){
			return true;
		} else {
			return false;
		}
	}
}