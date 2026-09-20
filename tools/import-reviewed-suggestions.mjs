// Reproducible import of the reviewed September 2026 suggestions.
// Usage: node tools/import-reviewed-suggestions.mjs <original pasted-text.txt>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';

const batch = 'user-suggestions-2026-09-20';
const definitions = [
  ['hijra-622',622,'Muhammed utvandrer fra Mekka til Medina',2,'Religion','Middelalderen','Den arabiske halvøy','☪️','Utvandringen kalles hijra og ble et vendepunkt for det muslimske fellesskapet. Året er utgangspunktet for den islamske tidsregningen.','Store norske leksikon','https://snl.no/hijra','Muhammed og tilhengerne'],
  ['landsloven-1274',1274,'Magnus Lagabøtes landslov innføres',2,'Politikk','Middelalderen','Norge','📜','Landsloven samlet store deler av lovverket for Norge i én felles lovbok. Den fikk betydning for rettsordningen i flere hundre år.','Nasjonalbiblioteket','https://www.nb.no/historier-fra-samlingen/var-forste-lovbok/','Magnus Lagabøte'],
  ['newton-principia-1687',1687,'Newton utgir Principia',2,'Vitenskap','Tidlig nytid','England','🍎','Isaac Newton samlet bevegelseslovene og loven om universell gravitasjon i verket Principia. Boka ble grunnleggende for klassisk mekanikk.','Cambridge University Library','https://wwwe.lib.cam.ac.uk/CUL/exhibitions/Footprints_of_the_Lion/gravity_glory.html','Newton utgir'],
  ['darwin-artenes-opprinnelse-1859',1859,'Darwin utgir Artenes opprinnelse',1,'Vitenskap','1800-tallet','Storbritannia','🐢','Charles Darwin presenterte hvordan naturlig utvalg kan bidra til at arter endrer seg over tid. Boka fikk stor betydning for biologien.','University of Cambridge','https://www.cam.ac.uk/news/darwins-delay-the-stuff-of-myth','Darwin utgir'],
  ['kvinner-begrenset-kommunal-stemmerett-1901',1901,'Kvinner får begrenset stemmerett ved kommunevalg',2,'Politikk','1900-tallet','Norge','🗳️','Kvinner som oppfylte bestemte økonomiske vilkår, fikk stemmerett ved kommunevalg. Dette var et steg mot allmenn stemmerett, men omfattet ennå ikke alle kvinner.','Stortinget','https://stortinget.no/no/Stortinget-og-demokratiet/stemmerettsjubileet-2019/fattigdom-stemmerett/tidslinje/','Kvinner får begrenset'],
  ['amundsen-sydpolen-1911',1911,'Amundsens ekspedisjon når Sydpolen',1,'Utforskning','1900-tallet','Antarktis','🧭','Roald Amundsen og fire ledsagere nådde Sydpolen 14. desember. De var den første dokumenterte ekspedisjonen som kom fram til polpunktet.','Frammuseet','https://frammuseum.no/en/polar-history/expeditions/the-third-fram-expedition-1910-1914/','Amundsen når'],
  ['menneskerettighetserklaeringen-1948',1948,'FNs verdenserklæring om menneskerettigheter vedtas',1,'Internasjonal politikk','Etterkrigstiden','Verden','🕊️','FNs generalforsamling vedtok erklæringen 10. desember. Den formulerer grunnleggende rettigheter som skal gjelde for alle mennesker.','FN-sambandet','https://fn.no/avtaler/menneskerettigheter/fns-verdenserklaering-om-menneskerettigheter','Verdenserklæringen'],
  ['vinter-ol-oslo-1952',1952,'Oslo arrangerer vinter-OL',1,'Idrett','Etterkrigstiden','Norge','⛷️','Norge arrangerte olympiske leker for første gang. Vinterlekene samlet utøvere fra mange land til konkurranser i Oslo og nærliggende områder.','Norges Olympiske Museum','https://ol.museum.no/om-olympiske-leker/ol-historie2','Vinter-OL i Oslo'],
  ['fjernsyn-offisiell-apning-1960',1960,'Fjernsynet åpner offisielt i Norge',2,'Kultur','Etterkrigstiden','Norge','📺','Etter flere år med prøvesendinger ble det norske fjernsynet offisielt åpnet 20. august. TV ble etter hvert en viktig del av hverdagen.','NRK','https://arkiv.nrk.no/programoversikt/avansert/index19d5.html','Fjernsynet åpner'],
  ['ekofisk-funnet-1969',1969,'Ekofiskfeltet blir oppdaget',1,'Økonomi','Etterkrigstiden','Norge','🛢️','Funnet av det store oljefeltet Ekofisk ble et vendepunkt for norsk petroleumsvirksomhet. Det la grunnlaget for en næring som fikk stor betydning for økonomien.','Norsk petroleum','https://www.norskpetroleum.no/fakta/funn/24-2-ekofisk/','Ekofiskfeltet'],
  ['gro-forste-kvinnelige-statsminister-1981',1981,'Gro Harlem Brundtland blir Norges første kvinnelige statsminister',1,'Politikk','Etterkrigstiden','Norge','🏛️','Gro Harlem Brundtland overtok som statsminister 4. februar. Hun var den første kvinnen som ledet en norsk regjering.','Regjeringen','https://www.regjeringen.no/en/the-government/previous-governments/historiske-artikler/offices/prime-minister-since-1814/gro-harlem-brundtland/id463420/','Gro Harlem'],
  ['sovjetunionen-opploses-1991',1991,'Sovjetunionen oppløses',1,'Internasjonal politikk','Den kalde krigen','Europa og Asia','🌍','Sovjetunionen ble formelt oppløst i desember. De tidligere sovjetrepublikkene ble selvstendige stater, og det politiske kartet ble endret.','Store norske leksikon','https://snl.no/Sovjetunionen','Sovjetunionen oppløses'],
  ['norge-nei-eu-1994',1994,'Norge sier nei til EU-medlemskap',1,'Politikk','Nyere tid','Norge','🗳️','Ved folkeavstemningen 28. november stemte et flertall mot norsk medlemskap i EU. Norge ble dermed stående utenfor unionen.','Stortinget','https://www.stortinget.no/no/Stortinget-og-demokratiet/Storting-og-regjering/Folkestyret/Folkeavstemninger/','Norge sier nei til EU'],
  ['vinter-ol-lillehammer-1994',1994,'Lillehammer arrangerer vinter-OL',1,'Idrett','Nyere tid','Norge','🎿','De olympiske vinterlekene ble arrangert på Lillehammer og andre steder i regionen. Det var andre gang Norge var vertskap for OL.','Norges Olympiske Museum','https://ol.museum.no/om-olympiske-leker/vinterleker/lillehammer-1994','Vinter-OL på Lillehammer']
];

const duplicateRules = [
 ['Jordbruk oppstår','G1'],['Skriftspråket','G2'],['Egypt samles','N2'],['Roma grunnlegges','N5'],['Perserkrigene','N7'],['Aleksander','N8'],['Romerriket deles','N14'],['Vestromerriket','G3'],['Lindisfarne','G4'],['Hafrsfjord','G5'],['Leiv Eiriksson','N19'],['Stiklestad','G7'],['Svartedauden rammer Norge','G14'],['Kalmarunionen','G15'],['Gutenberg','G16'],['Konstantinopel','N29'],['Columbus','N30'],['Martin Luther','N32'],['Reformasjonen innføres','G17'],['Trettiårskrigen','N38'],['Eneveldet','G20'],['industrielle revolusjonen','N41'],['USAs uavhengighet','N42'],['franske revolusjonen','G21'],['Grunnloven','G22'],['amerikanske borgerkrigen','N47'],['Tyskland samles','N50'],['Parlamentarismen','G26'],['Unionen mellom Norge og Sverige oppløses','G27'],['Kvinner får allmenn','G28'],['Første verdenskrig','G29'],['russiske revolusjonen','N52'],['Børskrakket','N53'],['Hitler kommer','N54'],['Andre verdenskrig','N55'],['Tyskland angriper Norge','G31'],['FN opprettes','N56'],['NATO','G33'],['Sputnik','N59'],['Berlinmuren bygges','N60'],['Cubakrisen','N61'],['lander på månen','G34'],['Norge sier nei til medlemskap i EF','G35'],['Tsjernobyl','N63'],['Berlinmuren faller','G36']
];

let text = readFileSync('events.js','utf8');
const context = { window: {} };
vm.runInNewContext(text,context);
const existing = context.window.TIMELINE_EVENTS;
const cards = definitions.map(([id,year,title,difficulty,category,period,region,emoji,info,sourceLabel,sourceUrl],i) => ({
 id,bankId:`U${i+1}`,year,displayYear:String(year),title,difficulty,category,period,region,emoji,image:'',info,tags:[category,region],sourceLabel,sourceUrl,suggestionSources:[batch]
}));
const additions = cards.filter(card => !existing.some(event => event.id === card.id));
for (const card of additions) if (existing.some(event => event.bankId === card.bankId)) throw Error(`ID collision: ${card.bankId}`);
if (additions.length) text = text.replace('window.TIMELINE_EVENTS = [','window.TIMELINE_EVENTS = [\n'+additions.map(card=>'  '+JSON.stringify(card)+',').join('\n'));
text = text.replace(/\/\/ \d+ kort totalt[^\n]*/,`// ${existing.length+additions.length} kort totalt. Bok- og forslagsreferanser er lagret på hvert tilknyttet kort.`);
writeFileSync('events.js',text);

const input=readFileSync(process.argv[2],'utf8');
const rows=input.split(/\r?\n/).filter(line=>line.includes('\t') && !/^(Tid|År)\t/.test(line));
const decisions=rows.map(line=>{
 const [time,title]=line.split('\t');
 const added=definitions.findIndex(def=>title.includes(def[11]));
 if(added>=0) return {time,title,status:'Lagt til',bankId:cards[added].bankId,note:added===1?'Rettet fra 1260-årene til 1274.':added===4?'Rettet fra 1893 til 1901 og presisert til kommunevalg. Begrenset stortingsstemmerett kom i 1907.':'Kontrollert kilde ligger på kortet.'};
 const duplicate=duplicateRules.find(([pattern])=>title.toLowerCase().includes(pattern.toLowerCase()));
 if(duplicate) return {time,title,status:'Finnes allerede',bankId:duplicate[1],note:'Ingen ny kopi. Eksisterende kort kan ha en annen avgrensning eller datering.'};
 let note='Egnet kandidat til en senere runde; krever egen kildekontroll og presis avgrensning før import.';
 if(time.includes('år siden')) note='Ventesatt til naturhistorisk kortgruppe: kontroller faglig datering, bruk fast tidsreferanse og tilpass visning/hint/poeng før import.';
 if(title.includes('Trias')||title.includes('Jura')||title.includes('Kritt')) note='Hel geologisk periode: velg startpunkt eller definer et periodekort. Unngå å gjenta dinosaurenes oppkomst.';
 if(title.includes('Jesus')) note='Ikke år 0: historisk tidsregning har ikke år null. Fødselsåret er usikkert og trenger intervall og kilde.';
 if(title.includes('Holocaust')) note='1933–1945 brukes om Holocaust i bred forstand; 1941–1945 beskriver en snevrere fase. Må avgrenses og kildebelegges.';
 if(title.includes('Stamford')) note='Normannernes erobring finnes som N21. Stamford Bridge er en separat hendelse; lag eventuelt et eget kort etter kildekontroll.';
 if(title.includes('Korstogene')) note='N22 dekker første korstog. Hele korstogsperioden er bredere og bør ikke bli en nesten lik kopi.';
 if(title.includes('Revolusjoner i Europa')) note='To ulike hendelser: splitt revolusjonene og utgivelsen av manifestet før kildekontroll.';
 if(title.includes('Kristendommen får')||title.includes('Norge samles gradvis')) note='Langvarig prosess som overlapper eksisterende kort G5/G6/G7; ikke ett sikkert hendelsesår.';
 return {time,title,status:'Ventesatt',note};
});
mkdirSync('reviews',{recursive:true});
writeFileSync(`reviews/${batch}.json`,JSON.stringify({id:batch,description:'Brukerens innlimte forslag; ikke hentet fra Teeple-boka.',decisions},null,2)+'\n');
const counts=Object.fromEntries(['Lagt til','Finnes allerede','Ventesatt'].map(status=>[status,decisions.filter(row=>row.status===status).length]));
writeFileSync(`reviews/${batch}.md`, `# Gjennomgang av brukerens kortforslag\n\n${rows.length} forslag: ${counts['Lagt til']} lagt til, ${counts['Finnes allerede']} dekket av eksisterende kort og ${counts.Ventesatt} ventesatt.\n\nDe nye kortene har nettbaserte kilder og suggestionSources, ikke bookSources: de skal ikke feilaktig tilskrives Teeple-boka. Endringene inngår i main fra 20. september 2026. Ventesatt betyr ikke faglig forkastet.\n\n| Tid i forslaget | Hendelse | Beslutning | Kort | Begrunnelse |\n| --- | --- | --- | --- | --- |\n`+decisions.map(row=>`| ${row.time} | ${row.title} | ${row.status} | ${row.bankId||'–'} | ${row.note} |`).join('\n')+'\n');
console.log({newCards:additions.length,total:existing.length+additions.length,reviewed:rows.length,...counts});
