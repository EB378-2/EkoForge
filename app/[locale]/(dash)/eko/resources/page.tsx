"use client";

import React from "react";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { motion } from "framer-motion";
import { Box, Container, Typography, Button, IconButton, Tooltip, Divider } from "@mui/material";
import { useTheme } from "@hooks/useTheme";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

const ResourcesDash: React.FC = () => {
  const t = useTranslations("ResourcesDash");
  const theme = useTheme();
  const [copiedEmail1, setCopiedEmail1] = React.useState(false);
  const [copiedEmail2, setCopiedEmail2] = React.useState(false);
  const [copiedEmail3, setCopiedEmail3] = React.useState(false);
  const [copiedEmail4, setCopiedEmail4] = React.useState(false);

  // Email templates
  const englishEmail1 = `Subject: Is Your Website Costing You Sales?

Hi [First Name],

In today's digital world, your website isn't just an online brochure—it's your business's most powerful sales tool. Yet, many businesses settle for generic, DIY websites that look nice but fail to attract visitors, build trust, or convert sales.

The harsh reality? A poorly designed website can:
- Drive customers to competitors (slow or confusing sites lose 40% of visitors in seconds)
- Waste your ad spend (if visitors don't convert, you're paying for clicks that go nowhere)
- Hurt your credibility (75% of users judge a company's trustworthiness based on design)

At [Your Company Name], we build high-converting websites that work like sales machines—optimized for speed, SEO, and mobile, with clear calls to action that turn visitors into paying customers.

Here's what we offer:
✅ Stunning, mobile-friendly designs tailored to your brand
✅ SEO-optimized content to attract organic traffic
✅ High-converting copywriting that drives action
✅ Fast-loading performance (under 2 seconds)

Would you be open to a quick 15-minute call to discuss how we could help you turn your website into a revenue generator? Let me know a time that works, or [book a slot here] [insert Calendly link].

Looking forward to your thoughts!

Best regards,
[Your Name]
[Your Company Name]
[Your Email] | [Your Phone]
[Website URL]`;

  const englishEmail2 = `Subject: Custom Website Solutions for [Their Business Name]

Hi [First Name],

I came across [Their Business Name] and noticed you're in [industry]. Many businesses in your space struggle with websites that don't reflect their professionalism or drive growth—especially when using template-based solutions.

Here's the good news: A strategically designed website can:
✔ Build instant credibility with modern, user-friendly design
✔ Attract qualified leads through targeted SEO and content
✔ Convert visitors effortlessly with intuitive navigation and clear CTAs
✔ Save you time with easy-to-update systems (no tech skills needed)

We specialize in custom websites that act as 24/7 sales reps for businesses like yours. For example, we helped [Similar Client] increase their online leads by [X%] in [timeframe].

Our process is straightforward:
1. Discovery call (we'll outline your goals and challenges)
2. Tailored proposal (no cookie-cutter solutions)
3. Seamless launch (we handle everything—you focus on your business)

Would you be available for a quick chat this week? I'd love to explore how we could help [Their Business Name] stand out and grow. You can reply to this email or [schedule a time here] [insert Calendly link].

Looking forward to connecting!

Best regards,
[Your Name]
[Your Company Name]
[Your Email] | [Your Phone]
[Website URL]`;

  const finnishEmail1 = `Aihe: Maksavatko huonot verkkosivut sinulle asiakkaita?

Hei [Etunimi],

Nykyään verkkosivustosi ei ole pelkkä esite – se on yrityksesi tehokkain myynnin työkalu. Monet kuitenkin luottavat valmiihin sivustorakentajiin, joiden sivut näyttävät kivalta, mutta eivät houkuttele asiakkaita tai luo myyntiä.

Kova totuus: Huonosti suunniteltu verkkosivu:
- Ajaa asiakkaat kilpailijoiden luo (hidas tai sekava sivu menettää 40 % kävijöistä sekunneissa)
- Tuhlaa mainosbudjettiasi (jos kävijät eivät osta, maksat turhista klikkauksista)
- Heikentää uskottavuuttasi (75 % käyttäjistä arvioi yrityksen luotettavuutta ulkoasun perusteella)

[Yrityksesi nimi] rakentaa korkean konversioon verkkosivustoja, jotka toimivat kuin myyntikoneet – optimoitu nopeuteen, hakukoneoptimointiin ja mobiiliystävällisyyteen sekä selkeillä toimintaohjeilla, jotka muuttavat kävijät maksaviksi asiakkaille.

Tarjoamme:
✅ Vaikuttavat, mobiiliystävälliset designit brändillesi räätälöitynä
✅ SEO-optimoitu sisältö, joka tuo organista liikennettä
✅ Myyntiä kasvattava sisältö, joka kannustaa toimintaan
✅ Salamannopea latausaika (alle 2 sekuntia)

Olisiko sinulla aikaa 15 minuutin puheluun, jossa voimme keskustella siitä, miten muuttaisimme verkkosivustosi myyntityökaluksi? Voit vastata tähän viestiin tai [varaa ajan tästä] [lisää Calendly-linkki].

Odotan mielenkiinnolla ajatuksiasi!

Ystävällisin terveisin,
[Nimesi]
[Yrityksesi nimi]
[Sähköpostisi] | [Puhelinnumerosi]
[Verkkosivuston URL]`;

  const finnishEmail2 = `Aihe: Räätälöidyt verkkosivuratkaisut yrityksellesi [Yrityksen nimi]

Hei [Etunimi],

Tutustuin yritykseesi [Yrityksen nimi] ja huomasin, että toimitte [ala]. Monilla alan yrityksillä on ongelmia verkkosivujen kanssa, jotka eivät heijasta ammattimaista imagoa tai kasvattaa myyntiä – erityisesti, kun käytetään valmiita malleja.

Hyvä uutinen on: Strategisesti suunniteltu verkkosivu voi:
✔ Rakentaa uskottavuutta modernilla ja käyttäjäystävällisellä ulkoasulla
✔ Tuoda laadukkaita liidejä kohdennetun SEO:n ja sisällön avulla
✔ Muuttaa kävijät asiakkaiksi helpolla navigoinnilla ja selkeillä toimintaohjeilla
✔ Säästää aikaasi helppokäyttöisillä päivitysjärjestelmillä (ei teknistä osaamista vaadita)

Erityisemme räätälöityihin verkkosivuihin, jotka toimivat yrityksesi 24/7 myyntiedustajina. Esimerkiksi autoimme [Vastaava asiakas] kasvattamaan verkkoliidejään [X%] [aikajaksolla].

Prosessimme on yksinkertainen:
1. Keskustelu (selvitämme tavoitteesi ja haasteet)
2. Räätälöity tarjous (ei valmispaketteja)
3. Saumaton julkaisu (hoidamme kaiken – voit keskittyä liiketoimintaasi)

Olisiko sinulla aikaa lyhyelle puhelulle tällä viikolla? Haluaisin kertoa, miten voisimme auttaa [Yrityksen nimi] erottumaan ja kasvamaan. Voit vastata tähän viestiin tai [varaa ajan tästä] [lisää Calendly-linkki].

Mukavaa päivänjatkoa!

Ystävällisin terveisin,
[Nimesi]
[Yrityksesi nimi]
[Sähköpostisi] | [Puhelinnumerosi]
[Verkkosivuston URL]`;

  // Animation variants for Framer Motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } },
  };

  const copyToClipboard = (text: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}>
        {t("title")}
      </Typography>

      <Box component={motion.div} initial="hidden" whileInView="visible" variants={fadeInUp}>
        {/* English Email 1 */}
        <Box sx={{ mb: 4, p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              English Email #1: Website Performance
            </Typography>
            <Tooltip title={copiedEmail1 ? "Copied!" : "Copy to clipboard"}>
              <IconButton
                onClick={() => copyToClipboard(englishEmail1, setCopiedEmail1)}
                color={copiedEmail1 ? "success" : "primary"}
              >
                {copiedEmail1 ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="body1" whiteSpace="pre-line">
            {englishEmail1}
          </Typography>
        </Box>

        {/* English Email 2 */}
        <Box sx={{ mb: 4, p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              English Email #2: Custom Solutions
            </Typography>
            <Tooltip title={copiedEmail2 ? "Copied!" : "Copy to clipboard"}>
              <IconButton
                onClick={() => copyToClipboard(englishEmail2, setCopiedEmail2)}
                color={copiedEmail2 ? "success" : "primary"}
              >
                {copiedEmail2 ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="body1" whiteSpace="pre-line">
            {englishEmail2}
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Finnish Email 1 */}
        <Box sx={{ mb: 4, p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              Finnish Email #1: Verkkosivuston suorituskyky
            </Typography>
            <Tooltip title={copiedEmail3 ? "Kopioitu!" : "Kopioi leikepöydälle"}>
              <IconButton
                onClick={() => copyToClipboard(finnishEmail1, setCopiedEmail3)}
                color={copiedEmail3 ? "success" : "primary"}
              >
                {copiedEmail3 ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="body1" whiteSpace="pre-line">
            {finnishEmail1}
          </Typography>
        </Box>

        {/* Finnish Email 2 */}
        <Box sx={{ mb: 4, p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              Finnish Email #2: Räätälöidyt ratkaisut
            </Typography>
            <Tooltip title={copiedEmail4 ? "Kopioitu!" : "Kopioi leikepöydälle"}>
              <IconButton
                onClick={() => copyToClipboard(finnishEmail2, setCopiedEmail4)}
                color={copiedEmail4 ? "success" : "primary"}
              >
                {copiedEmail4 ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="body1" whiteSpace="pre-line">
            {finnishEmail2}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ResourcesDash;