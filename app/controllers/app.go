package controllers

import (
	"strconv"

	"github.com/Acidic9/go-steam/steamapi"
	"github.com/Acidic9/go-steam/steamid"
	"github.com/revel/revel"
)

type App struct {
	*revel.Controller
}

func (c App) Index() revel.Result {
	return c.Render()
}

const SteamAPIKey = "E1FFB15B2C79FD99EFCE478B86B9E25A"

var steamAPI = steamapi.NewKey(SteamAPIKey)

type SearchResp struct {
	Success       bool `json:"success"`
	PlayerSummary *struct {
		steamapi.PlayerSummaries
		SteamLevel int `json:"steamLevel"`
		IDs        struct {
			ID   string `json:"id"`
			ID64 string `json:"id64"`
			ID32 uint32 `json:"id32"`
			ID3  string `json:"id3"`
		} `json:"ids"`
	} `json:"playerSummary,omitempty"`
	ResolvedVia *uint8 `json:"resolvedVia,omitempty"`
}

func (c App) APISearch(query string) revel.Result {
	id64, resolvedVia := steamid.ResolveID(query, SteamAPIKey)
	if id64 == 0 {
		// Unsuccessful
		return c.RenderJSON(&SearchResp{false, nil, nil})
	}

	playerSummary, err := steamAPI.GetSinglePlayerSummaries(uint64(id64))
	if err != nil {
		// Unsuccessful
		return c.RenderJSON(&SearchResp{false, nil, nil})
	}

	var summary = struct {
		steamapi.PlayerSummaries
		SteamLevel int `json:"steamLevel"`
		IDs        struct {
			ID   string `json:"id"`
			ID64 string `json:"id64"`
			ID32 uint32 `json:"id32"`
			ID3  string `json:"id3"`
		} `json:"ids"`
	}{
		playerSummary,
		0,
		struct {
			ID   string `json:"id"`
			ID64 string `json:"id64"`
			ID32 uint32 `json:"id32"`
			ID3  string `json:"id3"`
		}{
			string(id64.ToID()),
			strconv.FormatUint(uint64(id64), 10),
			uint32(id64.To32()),
			string(id64.To3()),
		},
	}

	steamLevel, _ := steamAPI.GetSteamLevel(uint64(id64))
	summary.SteamLevel = steamLevel

	return c.RenderJSON(&SearchResp{true, &summary, &resolvedVia})
}
