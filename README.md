
# Encore Stream Deck Plugin

This plugin is designed to make it easy to quickly glance at
the status of the Encore analysis server

# Description

The default action will include a visualization showing the 
total number of jobs currently running and the number of jobs
in the queue. You will need to provide a valid API token in
order to get the current server stats.
  
## Debugging the plugin

First, you need to enable debugging. It varies by OS

- On macOS, you will need to run the following command line in the Terminal:
  `defaults write com.elgato.StreamDeck html_remote_debugging_enabled -bool YES`
- On windows, set a DWORD `html_remote_debugging_enabled` registry key to 1 at 
  `HKEY_CURRENT_USER\Software\Elgato Systems GmbH\StreamDeck`

Once debugging is enabled, you can view the debugger at 

http://localhost:23654/

## Building the plugin

YOu will need to download the Distribution tool from
https://developer.elgato.com/documentation/stream-deck/sdk/exporting-your-plugin/

Then, to build the plugin, you can run

`.\DistributionTool.exe -b -i .\Sources\edu.umich.sph.encore.sdPlugin\ -o Release`

## Code template

This code is based off of the plugin template provided by Stream Deck
https://github.com/elgatosf/streamdeck-plugintemplate