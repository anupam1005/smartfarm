const { pool } = require('../config/database');

class CropAnalysisDAO {
  static async create(cropAnalysis) {
    const query = `
      INSERT INTO crop_analysis (
        farmer_id, image_url, crop_type, health_status,
        detected_issues, recommendations, soil_moisture,
        temperature, humidity, latitude, longitude, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      cropAnalysis.farmerId,
      cropAnalysis.imageUrl,
      cropAnalysis.cropType,
      cropAnalysis.healthStatus,
      JSON.stringify(cropAnalysis.detectedIssues || []),
      JSON.stringify(cropAnalysis.recommendations || []),
      cropAnalysis.soilMoisture,
      cropAnalysis.temperature,
      cropAnalysis.humidity,
      cropAnalysis.latitude,
      cropAnalysis.longitude,
      cropAnalysis.notes
    ];

    const [result] = await pool.execute(query, values);
    return result.insertId;
  }

  static async findByFarmerId(farmerId, limit) {
    let query = 'SELECT * FROM crop_analysis WHERE farmer_id = ? ORDER BY created_at DESC';
    if (limit) {
      query += ' LIMIT ?';
    }
    const params = limit ? [farmerId, limit] : [farmerId];
    const [rows] = await pool.execute(query, params);
    return rows.map(row => ({
      ...row,
      detectedIssues: JSON.parse(row.detected_issues),
      recommendations: JSON.parse(row.recommendations)
    }));
  }

  static async update(id, cropAnalysis) {
    const query = `
      UPDATE crop_analysis SET
        image_url = ?,
        crop_type = ?,
        health_status = ?,
        detected_issues = ?,
        recommendations = ?,
        soil_moisture = ?,
        temperature = ?,
        humidity = ?,
        latitude = ?,
        longitude = ?,
        notes = ?
      WHERE id = ?
    `;

    const values = [
      cropAnalysis.imageUrl,
      cropAnalysis.cropType,
      cropAnalysis.healthStatus,
      JSON.stringify(cropAnalysis.detectedIssues || []),
      JSON.stringify(cropAnalysis.recommendations || []),
      cropAnalysis.soilMoisture,
      cropAnalysis.temperature,
      cropAnalysis.humidity,
      cropAnalysis.latitude,
      cropAnalysis.longitude,
      cropAnalysis.notes,
      id
    ];

    await pool.execute(query, values);
  }

  static async delete(id) {
    const query = 'DELETE FROM crop_analysis WHERE id = ?';
    await pool.execute(query, [id]);
  }
}

module.exports = CropAnalysisDAO;