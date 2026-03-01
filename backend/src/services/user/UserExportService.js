const ExcelJS = require('exceljs');

const buildUsersWorkbook = async (users) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Korus';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Utilisateurs');
  sheet.columns = [
    { header: 'ID', key: 'id', width: 26 },
    { header: 'Nom', key: 'name', width: 26 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Téléphone', key: 'phone', width: 18 },
    { header: 'Adresse', key: 'adresse', width: 28 },
    { header: 'Rôle', key: 'role', width: 14 },
    { header: 'Statut', key: 'status', width: 14 },
    { header: 'Vérifié', key: 'verified', width: 10 },
    { header: 'Suspendu', key: 'isSuspended', width: 10 },
    { header: 'Fin suspension', key: 'suspensionEndDate', width: 18 },
    { header: 'Inscrit le', key: 'createdAt', width: 18 },
    { header: 'Dernière connexion', key: 'lastLoginAt', width: 20 },
    { header: 'Dernière déconnexion', key: 'lastLogoutAt', width: 22 }
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  (users || []).forEach((u) => {
    sheet.addRow({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      adresse: u.adresse,
      role: u.role,
      status: u.status,
      verified: u.is_verified ? 'Oui' : 'Non',
      isSuspended: u.isSuspended ? 'Oui' : 'Non',
      suspensionEndDate: u.suspensionEndDate || '',
      createdAt: u.created_at || '',
      lastLoginAt: u.lastLoginAt || '',
      lastLogoutAt: u.lastLogoutAt || ''
    });
  });

  // Détail des suspensions
  const suspSheet = workbook.addWorksheet('Suspensions');
  suspSheet.columns = [
    { header: 'User ID', key: 'userId', width: 26 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Début', key: 'start', width: 22 },
    { header: 'Fin', key: 'end', width: 22 },
    { header: 'Description', key: 'desc', width: 40 }
  ];
  suspSheet.getRow(1).font = { bold: true };
  suspSheet.views = [{ state: 'frozen', ySplit: 1 }];

  (users || []).forEach((u) => {
    const suspensions = Array.isArray(u.suspensions) ? u.suspensions : [];
    suspensions.forEach((s) => {
      suspSheet.addRow({
        userId: u.id,
        email: u.email,
        start: s?.started_date ? new Date(s.started_date).toISOString() : '',
        end: s?.end_date ? new Date(s.end_date).toISOString() : '',
        desc: s?.description || ''
      });
    });
  });

  // Historique de connexion
  const loginSheet = workbook.addWorksheet('Connexions');
  loginSheet.columns = [
    { header: 'User ID', key: 'userId', width: 26 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Login', key: 'login', width: 22 },
    { header: 'Logout', key: 'logout', width: 22 }
  ];
  loginSheet.getRow(1).font = { bold: true };
  loginSheet.views = [{ state: 'frozen', ySplit: 1 }];

  (users || []).forEach((u) => {
    const history = Array.isArray(u.login_history) ? u.login_history : [];
    history.forEach((h) => {
      loginSheet.addRow({
        userId: u.id,
        email: u.email,
        login: h?.login_date ? new Date(h.login_date).toISOString() : '',
        logout: h?.logout_date ? new Date(h.logout_date).toISOString() : ''
      });
    });
  });

  return workbook;
};

module.exports = {
  buildUsersWorkbook
};
