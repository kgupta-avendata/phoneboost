import { Component } from '@angular/core';
import { NavController, Platform, AlertController, ViewController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { EmailComposer } from '@ionic-native/email-composer';
import { NativeStorage } from '@ionic-native/native-storage';
 
@Component({
    selector: 'page-info',
    templateUrl: 'info.html'
})
export class InfoPage {
	public isBattryWaring: Boolean;
	// public isAnalysisTech: boolean;
	constructor(public navCtrl: NavController, public alertCtrl: AlertController, public platform: Platform, public viewCtrl: ViewController, public emailComposer: EmailComposer,  public nativeStorage: NativeStorage) {
			this.platform.registerBackButtonAction((event)=>{
			this.backToHome(event);
		})
		try { 
			this.isBattryWaring = new Boolean(this.nativeStorage.getItem('showBattryWaring'));
			console.log(this.isBattryWaring);
		} catch(err) {
			alert(err);
			this.isBattryWaring = true;
		}
		
		// this.isAnalysisTech = true;
	}

	ionViewDidLoad() {
		this.viewCtrl.setBackButtonText('');
	}

	backToHome(event) {
		this.navCtrl.setRoot(HomePage, {});
	}

	shareApp() {
		this.shareViaEmail();
	}

	shareViaEmail()
	{
		this.platform.ready()
		.then(() =>
		{
			let email = {
				// attachments: [
				//   'file://img/logo.png',
				//   'res://icon.png',
				//   'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
				//   'file://README.pdf'
				// ],
				subject: 'Data protection regulation',
				body: 'Data protection regulation',
				isHtml: true
			};
			this.emailComposer.open(email);
		});
	}

	batteryWaring() {
		this.isBattryWaring = !this.isBattryWaring;
		if(this.isBattryWaring) {
			this.doAlert("Battery Waring Activated");
		}
		this.nativeStorage.setItem('showBattryWaring', this.isBattryWaring.toString());
	}

	// analysisTechnology() {
	// 	this.isAnalysisTech = !this.isAnalysisTech;
	// 	if(this.isAnalysisTech) {
	// 		this.doAlert("Analysis Technology Activated");
	// 	}
	// }

	doAlert(message) {
		let alert = this.alertCtrl.create({
			message: message,
			buttons: ['Ok']
		});
		alert.present()
	}
}