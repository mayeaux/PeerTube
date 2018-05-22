import { VideoWatchPage } from './po/video-watch.po'
import { VideoUploadPage } from './po/video-upload.po'
import { LoginPage } from './po/login.po'
import { browser } from 'protractor'

describe('Videos workflow', () => {
  let videoWatchPage: VideoWatchPage
  let pageUploadPage: VideoUploadPage
  let loginPage: LoginPage
  const videoName = new Date().getTime() + ' video'
  let isMobileDevice = false
  let isIphoneDevice = false

  beforeEach(async () => {
    browser.waitForAngularEnabled(false)

    videoWatchPage = new VideoWatchPage()
    pageUploadPage = new VideoUploadPage()
    loginPage = new LoginPage()

    const caps = await browser.getCapabilities()
    isMobileDevice = caps.get('realMobile') === 'true' || caps.get('realMobile') === true
    isIphoneDevice = caps.get('device') === 'iphone'
  })

  it('Should log in', () => {
    if (isMobileDevice) {
      console.log('Skipping because we are on a real device and BrowserStack does not support file upload.')
      return
    }

    return loginPage.loginAsRootUser()
  })

  it('Should upload a video', async () => {
    if (isMobileDevice) {
      console.log('Skipping because we are on a real device and BrowserStack does not support file upload.')
      return
    }

    pageUploadPage.navigateTo()

    await pageUploadPage.uploadVideo()
    return pageUploadPage.validSecondUploadStep(videoName)
  })

  it('Should list the video', async () => {
    await videoWatchPage.goOnVideosList(isIphoneDevice)

    if (isMobileDevice) {
      console.log('Skipping because we are on a real device and BrowserStack does not support file upload.')
      return
    }

    const videoNames = videoWatchPage.getVideosListName()
    expect(videoNames).toContain(videoName)
  })

  it('Should go on video watch page', async () => {
    let videoNameToExcept = videoName

    if (isMobileDevice && isIphoneDevice) videoNameToExcept = 'PeerTube_Mobile.v.1'

    if (isMobileDevice && isIphoneDevice === false) videoNameToExcept = await videoWatchPage.clickOnFirstVideo()
    else await videoWatchPage.clickOnVideo(videoName)

    return videoWatchPage.waitWatchVideoName(videoNameToExcept)
  })

  it('Should play the video', async () => {
    await videoWatchPage.pauseVideo(7000, isMobileDevice, isIphoneDevice)
    expect(videoWatchPage.getWatchVideoPlayerCurrentTime()).toBeGreaterThanOrEqual(2)
  })
})