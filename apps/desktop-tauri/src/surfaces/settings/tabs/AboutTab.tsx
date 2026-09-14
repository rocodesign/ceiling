import { useEffect, useState } from "react";
import { useLocale } from "../../../hooks/useLocale";
import { formatLocale } from "../../../lib/formatLocale";
import { getAppInfo, openExternalUrl } from "../../../lib/tauri";
import type { AppInfoBridge } from "../../../types/bridge";
import type { TabProps } from "../../Settings";
import ceilingIcon from "../../../assets/ceiling-icon.png";

const ABOUT_LINKS = [
  {
    label: "GitHub",
    url: "https://github.com/tsouth89/ceiling",
  },
  {
    label: "Website",
    url: "https://ceiling.win",
  },
] as const;

export default function AboutTab(_props: TabProps) {
  const { t } = useLocale();
  const [appInfo, setAppInfo] = useState<AppInfoBridge | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    void getAppInfo().then(setAppInfo);
  }, []);

  const openAboutLink = (url: string) => {
    setLinkError(null);
    openExternalUrl(url).catch((error) => {
      setLinkError(String(error));
    });
  };

  if (!appInfo) {
    return (
      <section className="settings-section">
        <p className="settings-section__hint">{t("AboutLoading")}</p>
      </section>
    );
  }

  return (
    <section className="settings-section about-section">
      <div className="about-header">
        <img className="about-icon" src={ceilingIcon} alt="Ceiling" />
        <div className="about-title-block">
          <h2 className="about-title">{appInfo.name}</h2>
          <p className="about-version">
            {formatLocale(t("AboutVersion"), appInfo.version)}
            {appInfo.buildNumber !== "dev" && ` (${appInfo.buildNumber})`}
          </p>
          <p className="about-tagline">{appInfo.tagline}</p>
        </div>
      </div>

      <div className="about-links">
        {ABOUT_LINKS.map((link) => (
          <button
            key={link.url}
            type="button"
            className="about-link"
            onClick={() => openAboutLink(link.url)}
          >
            {link.label}
          </button>
        ))}
      </div>
      {linkError && (
        <p className="about-update-msg">
          {t("AboutLinkErrorPrefix")} {linkError}
        </p>
      )}

      <div className="about-divider" />

      <p className="about-copyright">
        {t("AboutCopyrightPrefix")}{" "}
        <button
          type="button"
          className="about-link about-link--inline"
          onClick={() =>
            openAboutLink("https://github.com/Finesssee/Win-CodexBar")
          }
        >
          Win-CodexBar
        </button>
        {t("AboutCopyrightMid")}{" "}
        <button
          type="button"
          className="about-link about-link--inline"
          onClick={() => openAboutLink("https://github.com/steipete/CodexBar")}
        >
          CodexBar
        </button>
        {t("AboutCopyrightSuffix")}
      </p>
    </section>
  );
}
