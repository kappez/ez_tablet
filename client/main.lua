local tabletOpen = false

--====================================
-- OPEN TABLET
--====================================
RegisterNetEvent("ez_tablet:open", function()

    print("[TABLET DEBUG] open event received")

    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = "open"
    })
end)

--====================================
-- CLOSE TABLET
--====================================
RegisterNUICallback("closeTablet", function(_, cb)

    tabletOpen = false

    SetNuiFocus(false, false)

    SendNUIMessage({
        action = "close"
    })

    cb("ok")
end)

--====================================
-- ESC CLOSE
--====================================
CreateThread(function()
    while true do

        if tabletOpen then
            Wait(0)

            DisableControlAction(0, 1, true)
            DisableControlAction(0, 2, true)

            if IsControlJustPressed(0, 322) then
                tabletOpen = false
                SetNuiFocus(false, false)
                SendNUIMessage({ action = "close" })
            end
        else
            Wait(500)
        end
    end
end)