const ExcelJS = require('exceljs');

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

const addKeyValueRows = (sheet, rows) => {
  sheet.columns = [
    { header: 'Clé', key: 'key', width: 34 },
    { header: 'Valeur', key: 'value', width: 30 }
  ];

  rows.forEach(({ key, value }) => {
    sheet.addRow({
      key,
      value: value === undefined ? null : value
    });
  });

  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
};

/**
 * Construit un workbook Excel à partir des statistiques admin (centre commercial).
 * @param {object} stats Retour de AdminStatisticService.getAdminStatistics
 * @param {{ startDate?: string, endDate?: string }} options
 */
const buildAdminStatisticsWorkbook = async (stats, options = {}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Korus';
  workbook.created = new Date();

  const startDate = options.startDate || null;
  const endDate = options.endDate || null;

  // 1) Période / Meta
  const metaSheet = workbook.addWorksheet('Période');
  addKeyValueRows(metaSheet, [
    { key: 'Date de début', value: startDate },
    { key: 'Date de fin', value: endDate },
    { key: 'Généré le', value: new Date().toISOString() }
  ]);

  // 2) KPI
  const kpiSheet = workbook.addWorksheet('Indicateurs');
  kpiSheet.columns = [
    { header: 'Indicateur', key: 'label', width: 38 },
    { header: 'Valeur', key: 'value', width: 22 }
  ];
  kpiSheet.getRow(1).font = { bold: true };
  kpiSheet.views = [{ state: 'frozen', ySplit: 1 }];

  const ca12 = stats?.CA12LastMonths?.total12Months ?? 0;
  const caMonth = stats?.CAMonthandGrowth?.caCurrentMonth ?? 0;
  const caPrev = stats?.CAMonthandGrowth?.caPrevMonth ?? 0;
  const growth = stats?.CAMonthandGrowth?.growthRatePercent;

  const kpis = [
    { label: 'Nombre de boutiques actives', value: toNumberOrNull(stats?.totalBoutiques) ?? 0 },
    { label: "Nombre d'utilisateurs", value: toNumberOrNull(stats?.totalUsers) ?? 0 },
    { label: 'Nombre de commandes', value: toNumberOrNull(stats?.totalCommandes) ?? 0 },
    { label: 'CA total (période)', value: toNumberOrNull(ca12) ?? 0 },
    { label: 'CA ce mois', value: toNumberOrNull(caMonth) ?? 0 },
    { label: 'CA mois précédent', value: toNumberOrNull(caPrev) ?? 0 },
    { label: 'Croissance mensuelle (%)', value: growth === null || growth === undefined ? null : Number(growth.toFixed ? growth.toFixed(2) : growth) }
  ];

  kpis.forEach((k) => kpiSheet.addRow(k));

  // Format numérique pour la colonne Valeur quand possible
  kpiSheet.getColumn('value').numFmt = '#,##0.00';

  // 3) CA par catégorie
  const catSheet = workbook.addWorksheet('CA par catégorie');
  catSheet.columns = [
    { header: 'Catégorie', key: 'category', width: 34 },
    { header: 'CA', key: 'ca', width: 18 }
  ];
  catSheet.getRow(1).font = { bold: true };
  catSheet.views = [{ state: 'frozen', ySplit: 1 }];

  const categories = stats?.CAShopAndCategory?.topShopCategory || [];
  categories.forEach((c) => {
    catSheet.addRow({
      category: c.shopCategoryName,
      ca: toNumberOrNull(c.totalCA) ?? 0
    });
  });
  catSheet.getColumn('ca').numFmt = '#,##0.00';

  // 4) CA par boutique
  const shopSheet = workbook.addWorksheet('CA par boutique');
  shopSheet.columns = [
    { header: 'Boutique', key: 'shop', width: 34 },
    { header: 'CA', key: 'ca', width: 18 }
  ];
  shopSheet.getRow(1).font = { bold: true };
  shopSheet.views = [{ state: 'frozen', ySplit: 1 }];

  const shops = stats?.CAShopAndCategory?.topBoutique || [];
  shops.forEach((b) => {
    shopSheet.addRow({
      shop: b.shopName,
      ca: toNumberOrNull(b.totalCA) ?? 0
    });
  });
  shopSheet.getColumn('ca').numFmt = '#,##0.00';

  return workbook;
};

/**
 * Construit un workbook Excel à partir des données du dashboard admin.
 * @param {object} dashboard Retour de AdminStatisticService.getAdminDashboard
 * @param {{ startDate?: string, endDate?: string }} options
 */
const buildAdminDashboardWorkbook = async (dashboard, options = {}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Korus';
  workbook.created = new Date();

  const startDate = options.startDate || null;
  const endDate = options.endDate || null;

  // 1) Période / Meta
  const metaSheet = workbook.addWorksheet('Période');
  addKeyValueRows(metaSheet, [
    { key: 'Date de début', value: startDate },
    { key: 'Date de fin', value: endDate },
    { key: 'Généré le', value: new Date().toISOString() }
  ]);

  // 2) Indicateurs du dashboard
  const kpiSheet = workbook.addWorksheet('Indicateurs');
  kpiSheet.columns = [
    { header: 'Indicateur', key: 'label', width: 38 },
    { header: 'Valeur', key: 'value', width: 22 }
  ];
  kpiSheet.getRow(1).font = { bold: true };
  kpiSheet.views = [{ state: 'frozen', ySplit: 1 }];

  const kpis = [
    { label: 'Nombre de boutiques actives', value: toNumberOrNull(dashboard?.totalBoutiques) ?? 0 },
    { label: "Nombre d'utilisateurs", value: toNumberOrNull(dashboard?.totalUsers) ?? 0 },
    { label: 'Nombre de commandes', value: toNumberOrNull(dashboard?.totalCommandes) ?? 0 },
    { label: 'CA total (12 derniers mois)', value: toNumberOrNull(dashboard?.CA12LastMonths?.total12Months) ?? 0 }
  ];

  kpis.forEach((k) => kpiSheet.addRow(k));
  kpiSheet.getColumn('value').numFmt = '#,##0.00';

  // 3) CA par mois (12 derniers mois)
  const seriesSheet = workbook.addWorksheet('CA par mois');
  seriesSheet.columns = [
    { header: 'Mois', key: 'month', width: 14 },
    { header: 'CA', key: 'ca', width: 18 }
  ];
  seriesSheet.getRow(1).font = { bold: true };
  seriesSheet.views = [{ state: 'frozen', ySplit: 1 }];

  const series = Array.isArray(dashboard?.CAParMois12DernierMois) ? dashboard.CAParMois12DernierMois : [];
  series.forEach((m) => {
    seriesSheet.addRow({
      month: m?._id ?? null,
      ca: toNumberOrNull(m?.total) ?? 0
    });
  });
  seriesSheet.getColumn('ca').numFmt = '#,##0.00';

  // 4) KPI Dashboard (si fourni)
  const kpi = options.kpi;
  if (kpi) {
    // -- Indicateurs KPI --
    const kpiDashSheet = workbook.addWorksheet('KPI Dashboard');
    kpiDashSheet.columns = [
      { header: 'Indicateur', key: 'label', width: 38 },
      { header: 'Valeur', key: 'value', width: 22 }
    ];
    kpiDashSheet.getRow(1).font = { bold: true };
    kpiDashSheet.views = [{ state: 'frozen', ySplit: 1 }];

    const kpiRows = [
      { label: 'CA total (6 derniers mois)', value: toNumberOrNull(kpi.totalCA) ?? 0 },
      { label: 'CA moyen mensuel', value: toNumberOrNull(kpi.caMoyenMensuel) ?? 0 },
      { label: 'Variation CA vs mois précédent (%)', value: toNumberOrNull(kpi.caVariation) ?? 0 },
      { label: 'Commandes par boutique', value: toNumberOrNull(kpi.commandesParBoutique) ?? 0 }
    ];
    kpiRows.forEach((k) => kpiDashSheet.addRow(k));
    kpiDashSheet.getColumn('value').numFmt = '#,##0.00';

    // -- Répartition CA par mois --
    const distSheet = workbook.addWorksheet('Répartition CA mensuel');
    distSheet.columns = [
      { header: 'Mois', key: 'mois', width: 14 },
      { header: 'CA', key: 'ca', width: 20 },
      { header: '%', key: 'pct', width: 10 }
    ];
    distSheet.getRow(1).font = { bold: true };
    distSheet.views = [{ state: 'frozen', ySplit: 1 }];

    const distribution = Array.isArray(kpi.caDistribution) ? kpi.caDistribution : [];
    distribution.forEach((d) => {
      distSheet.addRow({
        mois: d.mois,
        ca: toNumberOrNull(d.total) ?? 0,
        pct: toNumberOrNull(d.pourcentage) ?? 0
      });
    });
    distSheet.getColumn('ca').numFmt = '#,##0.00';
    distSheet.getColumn('pct').numFmt = '0.0';

    // -- Top Boutiques --
    const topShopSheet = workbook.addWorksheet('Top Boutiques');
    topShopSheet.columns = [
      { header: 'Boutique', key: 'nom', width: 34 },
      { header: 'CA', key: 'ca', width: 20 }
    ];
    topShopSheet.getRow(1).font = { bold: true };
    topShopSheet.views = [{ state: 'frozen', ySplit: 1 }];

    const topBoutiques = Array.isArray(kpi.topBoutiques) ? kpi.topBoutiques : [];
    topBoutiques.forEach((b) => {
      topShopSheet.addRow({
        nom: b.nom,
        ca: toNumberOrNull(b.totalCA) ?? 0
      });
    });
    topShopSheet.getColumn('ca').numFmt = '#,##0.00';

    // -- Top Catégories --
    const topCatSheet = workbook.addWorksheet('Top Catégories');
    topCatSheet.columns = [
      { header: 'Catégorie', key: 'nom', width: 34 },
      { header: 'CA', key: 'ca', width: 20 }
    ];
    topCatSheet.getRow(1).font = { bold: true };
    topCatSheet.views = [{ state: 'frozen', ySplit: 1 }];

    const topCategories = Array.isArray(kpi.topCategories) ? kpi.topCategories : [];
    topCategories.forEach((c) => {
      topCatSheet.addRow({
        nom: c.nom,
        ca: toNumberOrNull(c.totalCA) ?? 0
      });
    });
    topCatSheet.getColumn('ca').numFmt = '#,##0.00';
  }

  return workbook;
};

/**
 * Construit un workbook Excel à partir des statistiques utilisateurs admin.
 * @param {object} userStats Retour de AdminStatisticService.getAdminUserStatistics
 * @param {{ startDate?: string, endDate?: string }} options
 */
const buildAdminUserStatisticsWorkbook = async (userStats, options = {}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Korus';
  workbook.created = new Date();

  const startDate = options.startDate || null;
  const endDate = options.endDate || null;

  // 1) Période / Meta
  const metaSheet = workbook.addWorksheet('Période');
  addKeyValueRows(metaSheet, [
    { key: 'Date de début', value: startDate },
    { key: 'Date de fin', value: endDate },
    { key: 'Généré le', value: new Date().toISOString() }
  ]);

  // 2) Indicateurs utilisateurs
  const kpiSheet = workbook.addWorksheet('Indicateurs utilisateurs');
  kpiSheet.columns = [
    { header: 'Indicateur', key: 'label', width: 42 },
    { header: 'Valeur', key: 'value', width: 26 }
  ];
  kpiSheet.getRow(1).font = { bold: true };
  kpiSheet.views = [{ state: 'frozen', ySplit: 1 }];

  const orderStats = userStats?.orderStats || {};
  const orderUserStats = userStats?.orderUserStats || {};

  const kpis = [
    { label: "Temps moyen sur l'application (min/mois/utilisateur)", value: toNumberOrNull(userStats?.moyenneMensuelleGlobale) ?? 0 },
    { label: "Nombre d'acheteurs", value: toNumberOrNull(orderStats.totalUsers) ?? 0 },
    { label: 'Nombre total de commandes', value: toNumberOrNull(orderStats.totalOrders) ?? 0 },
    { label: 'Total commandes (MGA)', value: toNumberOrNull(orderStats.totalSpentAll) ?? 0 },
    { label: 'Panier moyen (MGA)', value: toNumberOrNull(orderStats.avgOrderTotal) ?? 0 },
    { label: 'Acheteurs ayant déjà commandé (%)', value: toNumberOrNull(orderUserStats.percentBuyersOrdered) ?? 0 },
    { label: 'Réachats (%)', value: toNumberOrNull(orderStats.percentUsersMultipleOrders) ?? 0 }
  ];

  kpis.forEach((k) => kpiSheet.addRow(k));
  kpiSheet.getColumn('value').numFmt = '#,##0.00';

  // 3) Heures de pic
  const hourlySheet = workbook.addWorksheet('Heures de pic');
  hourlySheet.columns = [
    { header: 'Heure', key: 'hour', width: 12 },
    { header: 'Utilisateurs actifs', key: 'activeUsers', width: 20 }
  ];
  hourlySheet.getRow(1).font = { bold: true };
  hourlySheet.views = [{ state: 'frozen', ySplit: 1 }];

  const hourlyData = userStats?.hourlyActiveUsers || [];
  hourlyData.forEach((h) => {
    hourlySheet.addRow({
      hour: h.hour,
      activeUsers: toNumberOrNull(h.activeUsers) ?? 0
    });
  });

  return workbook;
};

module.exports = {
  buildAdminStatisticsWorkbook,
  buildAdminDashboardWorkbook,
  buildAdminUserStatisticsWorkbook
};
