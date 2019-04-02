<script>
import { logout } from "@/util/auth";

export default {
  name: "Logout",
  created: function() {
    logout();
    this.$router.push("/");
  }
};
</script>


