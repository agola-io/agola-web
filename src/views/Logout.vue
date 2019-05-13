<script>
import { doLogout } from "@/util/auth";

export default {
  name: "Logout",
  created: function() {
    doLogout();
    this.$router.push("/");
  }
};
</script>


