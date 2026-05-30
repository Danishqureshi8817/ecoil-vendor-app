package com.arises.knp

import android.os.Build
import android.os.Bundle
import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Ecoil"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

       // Apply window insets handling for SDK 35+
    if (Build.VERSION.SDK_INT >= 35) {
      val rootView = findViewById<View>(android.R.id.content)
      ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
        val innerPadding = insets.getInsets(WindowInsetsCompat.Type.ime())
        rootView.setPadding(
          innerPadding.left,
          innerPadding.top,
          innerPadding.right,
          innerPadding.bottom
        )
        insets
      }
    }
  }



  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
