import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface GuardDogForm {
  name: string;
  breed: string;
  age: number;
  status: "active" | "resting" | "offline" | "medical";
  location: {
    lat: number;
    lng: number;
    zone: string;
  };
  handler: {
    name: string;
    contact: string;
  };
  healthMetrics: {
    heartRate: number;
    temperature: number;
    lastCheckup: number;
  };
}

export function GuardDogsPanel() {
  const dogs = useQuery(api.security.getGuardDogs);
  const addGuardDog = useMutation(api.security.addGuardDog);
  const updateGuardDog = useMutation(api.security.updateGuardDog);
  const updateDogStatus = useMutation(api.security.updateDogStatus);
  const deleteGuardDog = useMutation(api.security.deleteGuardDog);
  
  const [sortBy, setSortBy] = useState<"name" | "status" | "zone" | "lastPatrol">("name");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDog, setEditingDog] = useState<any>(null);
  const [formData, setFormData] = useState<GuardDogForm>({
    name: "",
    breed: "",
    age: 0,
    status: "active",
    location: { lat: 40.7128, lng: -74.0060, zone: "" },
    handler: { name: "", contact: "" },
    healthMetrics: { heartRate: 80, temperature: 101.5, lastCheckup: Date.now() }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      resting: "bg-yellow-100 text-yellow-800",
      offline: "bg-gray-100 text-gray-800",
      medical: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || colors.offline;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: "🟢",
      resting: "🟡",
      offline: "⚫",
      medical: "🔴",
    };
    return icons[status as keyof typeof icons] || "⚫";
  };

  const getHealthStatus = (metrics: any) => {
    const { heartRate, temperature } = metrics;
    if (heartRate > 100 || temperature > 102) return { status: "warning", color: "text-yellow-600" };
    if (heartRate < 60 || temperature < 100) return { status: "concern", color: "text-red-600" };
    return { status: "normal", color: "text-green-600" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDog) {
        await updateGuardDog({ dogId: editingDog._id, ...formData });
        setEditingDog(null);
      } else {
        await addGuardDog(formData);
      }
      setShowAddForm(false);
      setFormData({
        name: "",
        breed: "",
        age: 0,
        status: "active",
        location: { lat: 40.7128, lng: -74.0060, zone: "" },
        handler: { name: "", contact: "" },
        healthMetrics: { heartRate: 80, temperature: 101.5, lastCheckup: Date.now() }
      });
    } catch (error) {
      console.error("Error saving guard dog:", error);
    }
  };

  const handleEdit = (dog: any) => {
    setEditingDog(dog);
    setFormData({
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      status: dog.status,
      location: dog.location,
      handler: dog.handler,
      healthMetrics: dog.healthMetrics
    });
    setShowAddForm(true);
  };

  const handleDelete = async (dogId: any) => {
    if (confirm("Are you sure you want to delete this guard dog?")) {
      try {
        await deleteGuardDog({ dogId });
      } catch (error) {
        console.error("Error deleting guard dog:", error);
      }
    }
  };

  if (!dogs) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filter and sort dogs
  const filteredDogs = dogs
    .filter(dog => {
      const matchesSearch = dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dog.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dog.location.zone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || dog.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status.localeCompare(b.status);
        case "zone":
          return a.location.zone.localeCompare(b.location.zone);
        case "lastPatrol":
          return b.lastPatrol - a.lastPatrol;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Guard Dogs Management</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingDog(null);
                setFormData({
                  name: "",
                  breed: "",
                  age: 0,
                  status: "active",
                  location: { lat: 40.7128, lng: -74.0060, zone: "" },
                  handler: { name: "", contact: "" },
                  healthMetrics: { heartRate: 80, temperature: 101.5, lastCheckup: Date.now() }
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add Guard Dog
            </button>
            
            <input
              type="text"
              placeholder="Search dogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="resting">Resting</option>
              <option value="offline">Offline</option>
              <option value="medical">Medical</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="zone">Sort by Zone</option>
              <option value="lastPatrol">Sort by Last Patrol</option>
            </select>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editingDog ? "Edit Guard Dog" : "Add New Guard Dog"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                    <input
                      type="text"
                      required
                      value={formData.breed}
                      onChange={(e) => setFormData({...formData, breed: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="resting">Resting</option>
                      <option value="offline">Offline</option>
                      <option value="medical">Medical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                    <input
                      type="text"
                      required
                      value={formData.location.zone}
                      onChange={(e) => setFormData({...formData, location: {...formData.location, zone: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Handler Name</label>
                    <input
                      type="text"
                      required
                      value={formData.handler.name}
                      onChange={(e) => setFormData({...formData, handler: {...formData.handler, name: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Handler Contact</label>
                    <input
                      type="text"
                      required
                      value={formData.handler.contact}
                      onChange={(e) => setFormData({...formData, handler: {...formData.handler, contact: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (BPM)</label>
                    <input
                      type="number"
                      required
                      min="40"
                      max="150"
                      value={formData.healthMetrics.heartRate}
                      onChange={(e) => setFormData({...formData, healthMetrics: {...formData.healthMetrics, heartRate: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
                    <input
                      type="number"
                      required
                      min="98"
                      max="105"
                      step="0.1"
                      value={formData.healthMetrics.temperature}
                      onChange={(e) => setFormData({...formData, healthMetrics: {...formData.healthMetrics, temperature: parseFloat(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingDog(null);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingDog ? "Update" : "Add"} Guard Dog
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handler</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Patrol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDogs.map((dog) => {
                const healthStatus = getHealthStatus(dog.healthMetrics);
                return (
                  <tr key={dog._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{dog.name}</div>
                        <div className="text-sm text-gray-500">{dog.breed} • {dog.age} years</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dog.status)}`}>
                        {getStatusIcon(dog.status)} {dog.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{dog.location.zone}</div>
                      <div className="text-sm text-gray-500">
                        {dog.location.lat.toFixed(4)}, {dog.location.lng.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${healthStatus.color}`}>
                        {dog.healthMetrics.heartRate} BPM
                      </div>
                      <div className="text-sm text-gray-500">
                        {dog.healthMetrics.temperature}°F
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{dog.handler.name}</div>
                      <div className="text-sm text-gray-500">{dog.handler.contact}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(dog.lastPatrol).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(dog.lastPatrol).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateDogStatus({ 
                            dogId: dog._id, 
                            status: dog.status === "active" ? "resting" : "active" 
                          })}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {dog.status === "active" ? "Rest" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleEdit(dog)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dog._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDogs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐕</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {dogs.length === 0 ? "No Guard Dogs" : "No dogs match your filters"}
            </h3>
            <p className="text-gray-600">
              {dogs.length === 0 ? "Click 'Add Guard Dog' to get started." : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
