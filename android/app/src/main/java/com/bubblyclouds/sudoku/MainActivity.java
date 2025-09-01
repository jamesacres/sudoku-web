package com.bubblyclouds.sudoku;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import com.bubblyclouds.sudoku.plugins.SafeAreaPlugin.SafeAreaPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(SafeAreaPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
