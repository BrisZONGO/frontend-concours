const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Supprimer l'ancien compte admin si existe
    await User.deleteOne({ email: 'admin@concours.com' });
    
    // Créer le hash du mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Créer le nouvel admin
    const admin = new User({
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@concours.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+226XXXXXXXX',
      abonnement: {
        actif: false,
        expiration: null,
        dateDebut: null,
        forfait: 'mensuel'
      }
    });

    await admin.save();
    
    console.log('✅ ADMIN CRÉÉ AVEC SUCCÈS !');
    console.log('================================');
    console.log('📧 Email: admin@concours.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('👑 Rôle: admin');
    console.log('================================\n');

    // Vérification
    const verifyUser = await User.findOne({ email: 'admin@concours.com' });
    if (verifyUser) {
      const isValid = await bcrypt.compare('admin123', verifyUser.password);
      console.log(`🔍 Vérification mot de passe: ${isValid ? '✅ OK' : '❌ ÉCHEC'}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Installation terminée');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

createAdmin();
