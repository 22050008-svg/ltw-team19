module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add redirectUrl column to category_posters table
      await queryInterface.addColumn(
        'category_posters',
        'redirect_url',
        {
          type: Sequelize.STRING(500),
          allowNull: true,
          defaultValue: null,
          comment: 'URL to redirect when poster is clicked'
        }
      );
      console.log('✅ Migration: Added redirect_url column to category_posters table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Column redirect_url already exists, skipping...');
      } else {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('category_posters', 'redirect_url');
      console.log('✅ Migration: Removed redirect_url column from category_posters table');
    } catch (error) {
      console.log('⚠️  Could not rollback redirect_url column removal:', error.message);
    }
  }
};
